const Wishlist = require('../models/Wishlist');
const { successResponse, errorResponse } = require('../utils/response.util');
const { validateBody } = require('../middlewares/validation.middleware');
const { addToWishlistSchema } = require('../validations');

// ─────────────────────────────────────────────────────
// LẤY DANH SÁCH WISHLIST CỦA USER — GET /api/wishlist
// ─────────────────────────────────────────────────────
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistItems = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: require('../models/Product'),
          as: 'product',
          where: { status: 'active', visibility: 'public' },
          include: [
            {
              model: require('../models.Category'),
              as: 'category',
              attributes: ['id', 'name', 'slug'],
            },
            {
              model: require('../models.ProductImage'),
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
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, wishlistItems);
  } catch (error) {
    console.error('Get wishlist error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// THÊM SẢN PHẨM VÀO WISHLIST — POST /api/wishlist
// ─────────────────────────────────────────────────────
const addToWishlist = [
  validateBody(addToWishlistSchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;

      if (!product_id) return errorResponse(res, 'Thiếu product_id', 400);

      // Kiểm tra sản phẩm tồn tại
      const product = await require('../models/Product').findByPk(product_id);
      if (!product) return errorResponse(res, 'Sản phẩm không tồn tại', 404);
      if (product.status !== 'active' || product.visibility !== 'public') {
        return errorResponse(res, 'Sản phẩm không khả dụng', 400);
      }

      // Kiểm tra đã có trong wishlist chưa
      const existingItem = await Wishlist.findOne({
        where: { user_id: userId, product_id },
      });

      if (existingItem) {
        return errorResponse(res, 'Sản phẩm đã có trong wishlist', 409);
      }

      const wishlistItem = await Wishlist.create({
        user_id: userId,
        product_id,
      });

      return successResponse(res, wishlistItem, 'Thêm vào wishlist thành công', 201);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      console.error('Add to wishlist error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// XÓA SẢN PHẨM KHỎI WISHLIST — DELETE /api/wishlist/:product_id
// ─────────────────────────────────────────────────────
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.params;

    const wishlistItem = await Wishlist.findOne({
      where: { user_id: userId, product_id },
    });

    if (!wishlistItem) return errorResponse(res, 'Sản phẩm không có trong wishlist', 404);

    await wishlistItem.destroy();
    return successResponse(res, null, 'Xóa khỏi wishlist thành công');
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// KIỂM TRA SẢN PHẨM CÓ TRONG WISHLIST — GET /api/wishlist/check/:product_id
// ─────────────────────────────────────────────────────
const checkInWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.params;

    const wishlistItem = await Wishlist.findOne({
      where: { user_id: userId, product_id },
    });

    return successResponse(res, {
      inWishlist: !!wishlistItem,
      product_id: parseInt(product_id),
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist,
};
