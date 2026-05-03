
const { successResponse, errorResponse } = require('../utils/response.util');
const { validateBody } = require('../middlewares/validation.middleware');
const Comment = require('../models/Comment');

// ─────────────────────────────────────────────────────
// LẤY COMMENTS CỦA SẢN PHẨM — GET /api/comments/product/:productId
// ─────────────────────────────────────────────────────
const getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        product_id: productId,
        parent_id: null, // Chỉ lấy comments gốc
        is_approved: true,
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
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
          where: {
            is_approved: true,
          },
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

    return successResponse(res, {
      data: comments,
      total_items: count,
      total_pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// LẤY REPLIES CỦA COMMENT — GET /api/comments/:id/replies
// ─────────────────────────────────────────────────────
const getReplies = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const parentComment = await Comment.findByPk(id);
    if (!parentComment) return errorResponse(res, 'Không tìm thấy bình luận', 404);

    const { count, rows: replies } = await Comment.findAndCountAll({
      where: {
        parent_id: id,
        is_approved: true,
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'ASC']],
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

    return successResponse(res, {
      data: replies,
      total_items: count,
      total_pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Get replies error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// TẠO COMMENT — POST /api/comments
// ─────────────────────────────────────────────────────
const createComment = [
  validateBody({
    product_id: { type: 'number', required: true },
    content: { type: 'string', required: true, min: 1, max: 2000 },
    rating_id: { type: 'number', required: false },
    parent_id: { type: 'number', required: false },
  }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id, content, rating_id, parent_id } = req.body;

      // Kiểm tra product tồn tại
      const Product = require('../models/Product');
      const product = await Product.findByPk(product_id);
      if (!product) return errorResponse(res, 'Sản phẩm không tồn tại', 404);

      // Nếu là reply, kiểm tra parent comment tồn tại
      if (parent_id) {
        const parentComment = await Comment.findByPk(parent_id);
        if (!parentComment) return errorResponse(res, 'Bình luận cha không tồn tại', 404);
      }

      const comment = await Comment.create({
        user_id: userId,
        product_id,
        content: content.trim(),
        rating_id: rating_id || null,
        parent_id: parent_id || null,
        is_approved: true, // Auto approve hoặc tùy config
      });

      // Fetch lại với user info
      const fullComment = await Comment.findByPk(comment.id, {
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

      return successResponse(res, fullComment, 'Bình luận đã được thêm', 201);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(res, 'Dữ liệu không hợp lệ', 422, error.errors.map((e) => e.message));
      }
      console.error('Create comment error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// CẬP NHẬT COMMENT — PUT /api/comments/:id
// ─────────────────────────────────────────────────────
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    const comment = await Comment.findByPk(id);
    if (!comment) return errorResponse(res, 'Không tìm thấy bình luận', 404);

    // Chỉ người tạo mới được sửa
    if (comment.user_id !== userId) return errorResponse(res, 'Bạn không có quyền sửa bình luận này', 403);

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Nội dung bình luận không được để trống', 400);
    }

    await comment.update({
      content: content.trim(),
    });

    return successResponse(res, comment, 'Bình luận đã được cập nhật');
  } catch (error) {
    console.error('Update comment error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// XÓA COMMENT — DELETE /api/comments/:id
// ─────────────────────────────────────────────────────
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findByPk(id);
    if (!comment) return errorResponse(res, 'Không tìm thấy bình luận', 404);

    // Chỉ người tạo hoặc admin mới được xóa
    if (comment.user_id !== userId && userRole !== 'admin') {
      return errorResponse(res, 'Bạn không có quyền xóa bình luận này', 403);
    }

    // Soft delete (paranoia: true)
    await comment.destroy();

    return successResponse(res, null, 'Bình luận đã được xóa');
  } catch (error) {
    console.error('Delete comment error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// ĐÁNH DẤU COMMENT HỮU ÍCH — POST /api/comments/:id/helpful
// ─────────────────────────────────────────────────────
const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) return errorResponse(res, 'Không tìm thấy bình luận', 404);

    await comment.markHelpful();

    return successResponse(res, { helpful_count: comment.helpful_count }, 'Đã đánh dấu hữu ích');
  } catch (error) {
    console.error('Mark helpful error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// ADMIN: PHÊ DUYỆT/ẨN COMMENT — PUT /api/comments/:id/moderate
// ─────────────────────────────────────────────────────
const moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    if (typeof is_approved !== 'boolean') {
      return errorResponse(res, 'is_approved phải là boolean', 400);
    }

    const comment = await Comment.findByPk(id);
    if (!comment) return errorResponse(res, 'Không tìm thấy bình luận', 404);

    await comment.update({ is_approved });

    return successResponse(res, comment, is_approved ? 'Bình luận đã được phê duyệt' : 'Bình luận đã bị ẩn');
  } catch (error) {
    console.error('Moderate comment error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

module.exports = {
  getCommentsByProduct,
  getReplies,
  createComment,
  updateComment,
  deleteComment,
  markHelpful,
  moderateComment,
};
