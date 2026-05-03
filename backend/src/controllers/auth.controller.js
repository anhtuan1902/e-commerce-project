const { successResponse, errorResponse } = require('../utils/response.util');
const { validateBody } = require('../middlewares/validation.middleware');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema,
} = require('../validations');
const AppError = require('../utils/ApiError');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const User = require('../models/User');

// ─────────────────────────────────────────────────────
// ĐĂNG KÝ  —  POST /api/auth/register
// ─────────────────────────────────────────────────────
const register = [
  validateBody(registerSchema),
  async (req, res) => {
    try {
      const result = await authService.register(req.body);
      if (result.role === 'vendor') {
        return successResponse(
          res,
          {
            user: result.user,
          },
          'Đăng ký thành công. Tài khoản của bạn đang chờ được duyệt bởi admin',
          201,
        );
      }

      return successResponse(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        'Đăng ký thành công',
        201,
      );
    } catch (error) {
      if (error instanceof AppError) return errorResponse(res, error.message, error.statusCode);
      return errorResponse(res, 'Lỗi server');
    }
  },
];

// ─────────────────────────────────────────────────────
// ĐĂNG NHẬP  —  POST /api/auth/login
// ─────────────────────────────────────────────────────
const login = [
  validateBody(loginSchema),
  async (req, res) => {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, result, 'Đăng nhập thành công');
    } catch (error) {
      if (error instanceof AppError) return errorResponse(res, error.message, error.statusCode);
      return errorResponse(res, 'Lỗi server', 500);
    }
  },
];

// ─────────────────────────────────────────────────────
// GOOGLE CALLBACK  —  GET /api/auth/google/callback
// ─────────────────────────────────────────────────────
const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const result = await authService.googleCallback(user);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

    return res.redirect(
      `${frontendURL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`,
    );
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendURL}/auth/error`);
  }
};

// ─────────────────────────────────────────────────────
// LÀM MỚI TOKEN  —  POST /api/auth/refresh-token
// ─────────────────────────────────────────────────────
const refreshToken = [
  validateBody(refreshTokenSchema),
  async (req, res) => {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      return successResponse(res, result, 'Làm mới token thành công');
    } catch (error) {
      return errorResponse(res, error);
    }
  },
];

// ─────────────────────────────────────────────────────
// ĐĂNG XUẤT  —  POST /api/auth/logout
// ─────────────────────────────────────────────────────
const logout = [
  validateBody(logoutSchema),
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const accessToken = req.headers.authorization?.split(' ')[1];

      if (!refreshToken) throw new AppError('Refresh token không được để trống', 400);

      await authService.logout(accessToken, refreshToken);
      return successResponse(res, {}, 'Đăng xuất thành công');
    } catch (error) {
      return errorResponse(res, error);
    }
  },
];

// ─────────────────────────────────────────────────────
// ĐĂNG XUẤT TẤT CẢ THIẾT BỊ  —  POST /api/auth/logout-all
// ─────────────────────────────────────────────────────
const logoutAll = async (req, res) => {
  try {
    // Xóa tất cả refresh token của user này trong Redis
    const accessToken = req.headers.authorization?.split(' ')[1];
    const userId = req.user.id;
    await authService.logoutAll(accessToken, userId);
    return successResponse(res, null, 'Đã đăng xuất khỏi tất cả thiết bị');
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ─────────────────────────────────────────────────────
// XEM CÁC PHIÊN ĐĂNG NHẬP  —  GET /api/auth/sessions
// ─────────────────────────────────────────────────────
const getSessions = async (req, res) => {
  try {
    const sessions = await tokenService.getAllSessions(req.user.id);
    return successResponse(res, sessions);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ─────────────────────────────────────────────────────
// THÔNG TIN BẢN THÂN  —  GET /api/auth/me
// ─────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const result = await authService.getMe(req.user.id);
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ─────────────────────────────────────────────────────
// ĐỔI MẬT KHẨU  —  PUT /api/auth/change-password
// ─────────────────────────────────────────────────────
const changePassword = [
  validateBody(changePasswordSchema),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { password, new_password } = req.body;

      // Kiểm tra xem user có phải là Google account không
      const user = await User.findByPk(userId);
      const isGoogleUser = !!user.googleId;

      await authService.changePassword(userId, isGoogleUser ? null : password, new_password);

      return successResponse(res, null, 'Đổi mật khẩu thành công');
    } catch (error) {
      return errorResponse(res, error);
    }
  },
];

module.exports = {
  register,
  login,
  googleCallback,
  refreshToken,
  logout,
  logoutAll,
  getSessions,
  getMe,
  changePassword,
};
