const redis = require('../config/redis');
const { verifyAccessToken } = require('../utils/jwt.util');
const { errorResponse } = require('../utils/response.util');

// ── Xác thực JWT Access Token ─────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) return errorResponse(res, 'Unauthorized', 401);

    // Check blacklist
    const isBlacklisted = await redis.get(`blacklist:${accessToken}`);
    if (isBlacklisted) return errorResponse(res, 'Token đã bị thu hồi', 401);

    const decoded = verifyAccessToken(accessToken);

    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token đã hết hạn', 401);
    }
    return errorResponse(res, 'Token không hợp lệ', 401);
  }
};

// ── Phân quyền theo role ──────────────────────────────────
// Dùng: authorize('admin')  hoặc  authorize('admin', 'vendor')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Chưa xác thực', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Bạn không có quyền thực hiện hành động này', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
