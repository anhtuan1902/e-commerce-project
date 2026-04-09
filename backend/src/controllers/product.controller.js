const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/response.util');
const { validateBody, validateQuery } = require('../middlewares/validation.middleware');
const {
  createProductSchema,
  updateProductSchema,
  productListQuerySchema,
} = require('../validations');

// ─────────────────────────────────────────────────────
// LẤY DANH SÁCH SẢN PHẨM — GET /api/products
// ─────────────────────────────────────────────────────
const getProducts = [
  validateQuery(productListQuerySchema),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        category_id,
        vendor_id,
        status = 'active',
        visibility = 'public',
        min_price,
        max_price,
        sort_by = 'createdAt',
        sort_order = 'DESC',
      } = req.query;

      const offset = (page - 1) * limit;
      const where = { status, visibility };

      if (search) {
        where[require('sequelize').Op.or] = [
          { name: { [require('sequelize').Op.like]: `%${search}%` } },
          { description: { [require('sequelize').Op.like]: `%${search}%` } },
          { sku: { [require('sequelize').Op.like]: `%${search}%` } },
        ];
      }

      if (category_id) where.category_id = category_id;
      if (vendor_id) where.vendor_id = vendor_id;

      if (min_price || max_price) {
        where.price = {};
        if (min_price) where.price[require('sequelize').Op.gte] = min_price;
        if (max_price) where.price[require('sequelize').Op.lte] = max_price;
      }

      const order = [[sort_by, sort_order.toUpperCase()]];

      const { count, rows: products } = await Product.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order,
        include: [
          {
            model: require('../models/Category'),
            as: 'category',
            attributes: ['id', 'name', 'slug'],
          },
          {
            model: require('../models/Vendor'),
            as: 'vendor',
            attributes: ['id', 'name'],
          },
          {
            model: require('../models/ProductImage'),
            as: 'images',
            where: { is_primary: true },
            required: false,
            attributes: ['id', 'url', 'alt_text'],
          },
          {
            model: require('../models.Inventory'),
            as: 'inventory',
            attributes: ['quantity', 'track_inventory'],
          },
        ],
      });

      return successResponse(res, {
        products,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Get products error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

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
          model: require('../models.Vendor'),
          as: 'vendor',
          attributes: ['id', 'name'],
        },
        {
          model: require('../models.ProductImage'),
          as: 'images',
          attributes: ['id', 'url', 'alt_text', 'sort_order', 'is_primary'],
        },
        {
          model: require('../models.Inventory'),
          as: 'inventory',
          attributes: ['quantity', 'track_inventory', 'low_stock_threshold'],
        },
        {
          model: require('../models.Rating'),
          as: 'ratings',
          attributes: ['rating', 'user_id'],
        },
      ],
    });

    if (!product) return errorResponse(res, 'Không tìm thấy sản phẩm', 404);

    // Tính rating trung bình
    const ratings = product.ratings || [];
    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

    return successResponse(res, {
      ...product.toJSON(),
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
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
        attributes,
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
        attributes: attributes !== undefined ? attributes : product.attributes,
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
