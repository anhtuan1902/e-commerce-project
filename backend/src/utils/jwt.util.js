const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const ACCESS_TOKEN_EXPIRES = '30m'; // Access token hết hạn sau 30 phút
const REFRESH_TOKEN_EXPIRES = '7d'; // Refresh token hết hạn sau 7 ngày

// ── Tạo Access Token (ngắn hạn) ───────────────────────────
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
};

// ── Tạo Refresh Token kèm tokenId ────────────────────
// tokenId: mã định danh duy nhất cho mỗi phiên đăng nhập
// Dùng để lưu/xóa chính xác token trong Redis
const generateRefreshToken = (payload) => {
  const tokenId = uuidv4();

  const refreshToken = jwt.sign({ ...payload, tokenId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });

  return { refreshToken, tokenId };
};

// ── Tạo cặp Access + Refresh Token ───────────────────────
const generateTokenPair = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = generateAccessToken(payload);
  const { refreshToken, tokenId } = generateRefreshToken(payload);

  return { accessToken, refreshToken, tokenId };
};

// ── Verify Access Token ────────────────────────────────────
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// ── Verify Refresh Token ───────────────────────────────────
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
};
