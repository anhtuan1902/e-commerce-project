const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/response.util');
const { validateBody } = require('../middlewares/validation.middleware');
const { createProductSchema, updateProductSchema } = require('../validations');
const { buildQueryOptions } = require('../utils/queryBuilder');
const Vendor = require('../models/Vendor');
const ProductImage = require('../models/ProductImage');

// ─────────────────────────────────────────────────────
// LẤY DANH SÁCH SẢN PHẨM — GET /api/products
// ─────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { where, order, limit, offset } = buildQueryOptions(req.query);

    const safeOrder = Array.isArray(order) ? order : [];

    const hasPagination = Number.isInteger(limit) && Number.isInteger(offset) && limit > 0;

    if (hasPagination) {
      const { count, rows: products } = await Product.findAndCountAll({
        where,
        order: safeOrder,
        limit,
        offset,
        include: [
          { model: Vendor, as: 'vendor', attributes: ['id', 'store_name', 'address'] },
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'image_url', 'alt_text', 'sort_order', 'is_primary'],
          },
        ],
      });

      return successResponse(res, {
        data: products,
        total_items: count,
        total_pages: Math.ceil(count / limit),
      });
    }

    const products = await Product.findAll({
      where,
      order: safeOrder,
    });

    return successResponse(res, products);
  } catch (error) {
    console.error('Get products error:', {
      message: error.message,
      stack: error.stack,
    });

    return errorResponse(res, 'Lỗi server');
  }
};
// ─────────────────────────────────────────────────────
// LẤY CHI TIẾT SẢN PHẨM — GET /api/products/:id
// ─────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: require('../models/Category'),
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: require('../models/Vendor'),
          as: 'vendor',
          attributes: [
            'id',
            'store_name',
            'logo_url',
            'description',
            'contact_email',
            'contact_phone',
            'address',
            'status',
          ],
        },
        {
          model: require('../models/ProductImage'),
          as: 'images',
          attributes: ['id', 'image_url', 'alt_text', 'sort_order', 'is_primary'],
          order: [
            ['sort_order', 'ASC'],
            ['createdAt', 'ASC'],
          ],
        },
        {
          model: require('../models/Inventory'),
          as: 'inventory',
          attributes: ['id', 'quantity', 'track_inventory', 'low_stock_threshold'],
        },
      ],
    });

    if (!product) return errorResponse(res, 'Không tìm thấy sản phẩm', 404);

    // Lấy ratings riêng để filter approved
    const Rating = require('../models/Rating');
    const Comment = require('../models/Comment');

    const ratings = await Rating.findAll({
      where: { product_id: id, status: 'approved' },
      attributes: [
        'id',
        'rating_value',
        'comment',
        'title',
        'is_verified_purchase',
        'helpful_count',
        'createdAt',
      ],
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: require('../models/User'),
          as: 'user',
          attributes: ['id'],
          include: [
            {
              model: require('../models/UserProfile'),
              as: 'profile',
              attributes: ['name', 'avatar'],
            },
          ],
        },
      ],
    });

    // Lấy comments với replies
    const comments = await Comment.findAll({
      where: {
        product_id: id,
        parent_id: null, // Chỉ lấy comments gốc
        is_approved: true,
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: require('../models/User'),
          as: 'user',
          attributes: ['id'],
          include: [
            {
              model: require('../models/UserProfile'),
              as: 'profile',
              attributes: ['name', 'avatar'],
            },
          ],
        },
        {
          model: Comment,
          as: 'replies',
          where: { is_approved: true },
          required: false,
          include: [
            {
              model: require('../models/User'),
              as: 'user',
              attributes: ['id'],
              include: [
                {
                  model: require('../models/UserProfile'),
                  as: 'profile',
                  attributes: ['name', 'avatar'],
                },
              ],
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length : 0;

    // Đếm số lượt like từ wishlist
    const Wishlist = require('../models/Wishlist');
    const likedCount = await Wishlist.count({
      where: { product_id: id },
    });

    const productData = product.toJSON();

    return successResponse(res, {
      ...productData,
      ratings: ratings.map((r) => r.toJSON()),
      comments: comments.map((c) => c.toJSON()),
      totalComments: comments.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      liked: likedCount,
    });
  } catch (error) {
    console.error('Get product by id error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// TẠO SẢN PHẨM MỚI (VENDOR ONLY) — POST /api/products
// ─────────────────────────────────────────────────────
const createProduct = [
  validateBody(createProductSchema),
  async (req, res) => {
    try {
      const vendorId = req.user.vendor?.id;
      if (!vendorId) return errorResponse(res, 'Chỉ vendor mới có thể tạo sản phẩm', 403);

      const {
        category_id,
        name,
        description,
        short_description,
        sku,
        price,
        compare_price,
        cost_price,
        weight,
        dimensions,
        tags,
        attributes,
        status = 'draft',
        visibility = 'public',
        allow_backorders = false,
        sold_individually = false,
        featured = false,
        seo_title,
        seo_description,
      } = req.body;

      const product = await Product.create({
        vendor_id: vendorId,
        category_id,
        name,
        description,
        short_description,
        sku,
        price,
        compare_price,
        cost_price,
        weight,
        dimensions,
        tags,
        attributes,
        status,
        visibility,
        allow_backorders,
        sold_individually,
        featured,
        seo_title,
        seo_description,
      });

      return successResponse(res, product, 'Tạo sản phẩm thành công', 201);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return errorResponse(res, 'SKU đã tồn tại', 409);
      }
      console.error('Create product error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// CẬP NHẬT SẢN PHẨM (VENDOR ONLY) — PUT /api/products/:id
// ─────────────────────────────────────────────────────
const updateProduct = [
  validateBody(updateProductSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const vendorId = req.user.vendor?.id;

      const product = await Product.findOne({
        where: { id, vendor_id: vendorId },
      });

      if (!product)
        return errorResponse(res, 'Không tìm thấy sản phẩm hoặc không có quyền truy cập', 404);

      const {
        category_id,
        name,
        description,
        short_description,
        sku,
        price,
        compare_price,
        cost_price,
        weight,
        dimensions,
        tags,
        product_attributes,
        status,
        visibility,
        allow_backorders,
        sold_individually,
        featured,
        seo_title,
        seo_description,
      } = req.body;

      // Kiểm tra SKU trùng lặp
      if (sku && sku !== product.sku) {
        const existingProduct = await Product.findOne({ where: { sku } });
        if (existingProduct) return errorResponse(res, 'SKU đã tồn tại', 409);
      }

      await product.update({
        category_id: category_id || product.category_id,
        name: name || product.name,
        description: description !== undefined ? description : product.description,
        short_description:
          short_description !== undefined ? short_description : product.short_description,
        sku: sku || product.sku,
        price: price || product.price,
        compare_price: compare_price !== undefined ? compare_price : product.compare_price,
        cost_price: cost_price !== undefined ? cost_price : product.cost_price,
        weight: weight !== undefined ? weight : product.weight,
        dimensions: dimensions !== undefined ? dimensions : product.dimensions,
        tags: tags !== undefined ? tags : product.tags,
        product_attributes:
          product_attributes !== undefined ? product_attributes : product.product_attributes,
        status: status || product.status,
        visibility: visibility || product.visibility,
        allow_backorders:
          allow_backorders !== undefined ? allow_backorders : product.allow_backorders,
        sold_individually:
          sold_individually !== undefined ? sold_individually : product.sold_individually,
        featured: featured !== undefined ? featured : product.featured,
        seo_title: seo_title !== undefined ? seo_title : product.seo_title,
        seo_description: seo_description !== undefined ? seo_description : product.seo_description,
      });

      return successResponse(res, product, 'Cập nhật sản phẩm thành công');
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      console.error('Update product error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// XÓA SẢN PHẨM (VENDOR ONLY) — DELETE /api/products/:id
// ─────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.vendor?.id;

    const product = await Product.findOne({
      where: { id, vendor_id: vendorId },
    });

    if (!product)
      return errorResponse(res, 'Không tìm thấy sản phẩm hoặc không có quyền truy cập', 404);

    await product.destroy();
    return successResponse(res, null, 'Xóa sản phẩm thành công');
  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
