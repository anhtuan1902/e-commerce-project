const User = require('../models/User');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/response.util');
const {
  validateBody,
  validateQuery,
  validateParams,
} = require('../middlewares/validation.middleware');
const {
  updateUserSchema,
  updateProfileSchema,
  userListQuerySchema,
  idParamSchema,
} = require('../validations');
const { buildQueryOptions } = require('../utils/queryBuilder');

// ─────────────────────────────────────────────────────
// LẤY DANH SÁCH USER (ADMIN ONLY) — GET /api/users
// ─────────────────────────────────────
const getUsers = [
  validateQuery(userListQuerySchema),
  async (req, res) => {
    try {
      const { search, role, isActive } = req.query;
      const { where, order, limit, offset, current_page } = buildQueryOptions(req.query);

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;

      if (limit !== null && offset !== null) {
        const { count, rows: users } = await User.findAndCountAll({
          where,
          limit,
          offset,
          order,
          attributes: { exclude: ['password', 'refreshToken'] },
        });

        return successResponse(res, {
          data: users,
          total_items: count,
          total_pages: Math.ceil(count / limit),
          current_page,
        });
      }

      const users = await User.findAll({
        where,
        order,
        attributes: { exclude: ['password', 'refreshToken'] },
      });

      return successResponse(res, users);
    } catch (error) {
      console.error('Get users error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// LẤY CHI TIẾT USER — GET /api/users/:id
// ─────────────────────────────────────────────────────
const getUserById = [
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'refreshToken'] },
        include: [
          { model: require('../models/UserProfile'), as: 'profile' },
          { model: require('../models/LoyaltyWallet'), as: 'wallet' },
        ],
      });

      if (!user) return errorResponse(res, 'Không tìm thấy user', 404);

      return successResponse(res, user);
    } catch (error) {
      console.error('Get user by id error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// CẬP NHẬT USER — PUT /api/users/:id
// ─────────────────────────────────────────────────────
const updateUser = [
  validateBody(updateUserSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, isActive, isVerified } = req.body;

      const user = await User.findByPk(id);
      if (!user) return errorResponse(res, 'Không tìm thấy user', 404);

      // Kiểm tra email trùng lặp
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return errorResponse(res, 'Email đã được sử dụng', 409);
      }

      // Cập nhật User
      await user.update({
        name: name || user.name,
        email: email || user.email,
        role: role || user.role,
        isActive: isActive !== undefined ? isActive : user.isActive,
        isVerified: isVerified !== undefined ? isVerified : user.isVerified,
      });

      return successResponse(res, user.toSafeObject(), 'Cập nhật user thành công');
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      console.error('Update user error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// XÓA USER — DELETE /api/users/:id
// ─────────────────────────────────────────────────────
const deleteUser = [
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) return errorResponse(res, 'Không tìm thấy user', 404);

      await user.destroy();
      return successResponse(res, null, 'Xóa user thành công');
    } catch (error) {
      console.error('Delete user error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// CẬP NHẬT PROFILE CỦA CHÍNH MÌNH — PUT /api/users/profile
// ─────────────────────────────────────────────────────
const updateProfile = [
  validateBody(updateProfileSchema),
  async (req, res) => {
    try {
      const { name } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) return errorResponse(res, 'Không tìm thấy user', 404);

      // Cập nhật name trong User
      if (name !== undefined) {
        await user.update({ name });
      }

      return successResponse(res, user.toSafeObject(), 'Cập nhật profile thành công');
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return errorResponse(
          res,
          'Dữ liệu không hợp lệ',
          422,
          error.errors.map((e) => e.message),
        );
      }
      console.error('Update profile error:', error);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
};
