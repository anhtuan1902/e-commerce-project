const { verifyAccessToken } = require('../utils/jwt.util');
const { errorResponse } = require('../utils/response.util');

// ── Xác thực JWT Access Token ─────────────────────────────
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Vui lòng đăng nhập', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

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
