const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/jwt.util');
const { successResponse, errorResponse } = require('../utils/response.util');
const tokenService = require('../services/token.services');

// ─────────────────────────────────────────────────────
// ĐĂNG KÝ  —  POST /api/auth/register
// ─────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return errorResponse(res, 'Email đã được sử dụng', 409);

    const allowedRoles = ['customer', 'vendor'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const user = await User.create({ name, email, password, role: userRole });

    // Tạo token pair (accessToken + refreshToken + tokenId)
    const { accessToken, refreshToken, tokenId } = generateTokenPair(user);

    // Lưu refreshToken vào Redis (không lưu vào MySQL nữa)
    await tokenService.saveRefreshToken(user.id, tokenId, refreshToken);

    // Cập nhật lastLoginAt trong MySQL
    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    // Lưu accessToken và refreshToken vào cookie
    tokenService.setTokenCookie(res, refreshToken, accessToken);

    return successResponse(res, { user: user.toSafeObject() }, 'Đăng ký thành công', 201);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return errorResponse(
        res,
        'Dữ liệu không hợp lệ',
        422,
        error.errors.map((e) => e.message),
      );
    }
    console.error('Register error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// ĐĂNG NHẬP  —  POST /api/auth/login
// ─────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, 'Vui lòng nhập email và mật khẩu', 400);

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401);
    if (!user.isActive) return errorResponse(res, 'Tài khoản đã bị khóa', 403);
    if (!user.password) return errorResponse(res, 'Tài khoản này đăng nhập bằng Google', 400);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401);

    const { accessToken, refreshToken, tokenId } = generateTokenPair(user);

    // Lưu vào Redis
    await tokenService.saveRefreshToken(user.id, tokenId, refreshToken);
    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    // Lưu refresh and access vào cookie và k cần trả
    tokenService.setTokenCookie(res, refreshToken, accessToken);

    return successResponse(
      res,
      {
        user: user.toSafeObject(),
      },
      'Đăng nhập thành công',
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ─────────────────────────────────────────────────────
// GOOGLE CALLBACK  —  GET /api/auth/google/callback
// ─────────────────────────────────────────────────────
const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const { accessToken, refreshToken, tokenId } = generateTokenPair(user);

    // Lưu vào Redis
    await tokenService.saveRefreshToken(user.id, tokenId, refreshToken);
    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Lưu refresh and access vào cookie và k cần trả
    tokenService.setTokenCookie(res, refreshToken, accessToken);

    return res.redirect(`${frontendURL}/auth/callback`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendURL}/auth/error`);
  }
};

// ─────────────────────────────────────────────────────
// LÀM MỚI TOKEN  —  POST /api/auth/refresh-token
// ─────────────────────────────────────────────────────
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return errorResponse(res, 'Thiếu refresh token', 400);

    // Bước 1: Verify chữ ký JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 401);
      }
      return errorResponse(res, 'Token không hợp lệ', 401);
    }

    const { id: userId, tokenId } = decoded;

    // Bước 2: Kiểm tra token có trong Redis không
    // Nếu không có → đã logout hoặc đã bị xóa
    const savedToken = await tokenService.getRefreshToken(userId, tokenId);
    if (!savedToken) {
      return errorResponse(res, 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại', 401);
    }

    // Bước 3: So sánh token gửi lên với token trong Redis
    if (savedToken.token !== token) {
      // Có thể bị tấn công — xóa tất cả session của user này
      await tokenService.deleteAllRefreshTokens(userId);
      return errorResponse(res, 'Phát hiện bất thường, vui lòng đăng nhập lại', 401);
    }

    // Bước 4: Lấy thông tin user
    const user = await User.findByPk(userId);
    if (!user || !user.isActive) {
      return errorResponse(res, 'Tài khoản không hợp lệ', 401);
    }

    // Bước 5: Tạo cặp token mới
    const { accessToken: newAccessToken } = generateAccessToken(user);

    // Lưu token mới vào cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokenService.ACCESS_TOKEN_TTL * 1000, // 30 phút
    });

    return successResponse(
      res,
      {
        accessToken: newAccessToken,
      },
      'Làm mới token thành công',
    );
  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 'Lỗi server');
  }
};

// ─────────────────────────────────────────────────────
// ĐĂNG XUẤT  —  POST /api/auth/logout
// ─────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      try {
        // Xóa đúng token của thiết bị đang logout
        const decoded = verifyRefreshToken(token);
        await tokenService.deleteRefreshToken(req.user.id, decoded.tokenId);
      } catch {
        // Token đã hết hạn nhưng vẫn cho logout bình thường
      }
    }

    return successResponse(res, null, 'Đăng xuất thành công');
  } catch (error) {
    return errorResponse(res, error);
  }
};

// ─────────────────────────────────────────────────────
// ĐĂNG XUẤT TẤT CẢ THIẾT BỊ  —  POST /api/auth/logout-all
// ─────────────────────────────────────────────────────
const logoutAll = async (req, res) => {
  try {
    // Xóa tất cả refresh token của user này trong Redis
    await tokenService.deleteAllRefreshTokens(req.user.id);
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
    const user = await User.findByPk(req.user.id);
    if (!user) return errorResponse(res, 'Không tìm thấy user', 404);
    return successResponse(res, user.toSafeObject());
  } catch (error) {
    return errorResponse(res, error);
  }
};

module.exports = {
  register,
  login,
  googleCallback,
  refreshToken,
  logout,
  logoutAll,
  getSessions,
  getMe,
};
