const redis = require("../config/redis");

// Key pattern: refresh_token:{userId}:{tokenId}
// Cho phép 1 user có nhiều phiên đăng nhập (nhiều thiết bị)
const makeKey = (userId, tokenId) => `refresh_token:${userId}:${tokenId}`;

const TTL = Number(process.env.REDIS_TTL) || 604800; // 7 ngày (giây)

// ── Lưu Refresh Token vào Redis ───────────────────────
// Gọi khi: đăng nhập, đăng ký, refresh token
const saveRefreshToken = async (userId, tokenId, token) => {
  const key = makeKey(userId, tokenId);

  // HSET lưu dạng hash — dễ đọc hơn plain string
  await redis.hset(key, {
    token,
    userId: String(userId),
    createdAt: new Date().toISOString(),
  });

  // Đặt TTL — tự xóa sau 7 ngày
  await redis.expire(key, TTL);
};

// ── Lấy Refresh Token từ Redis ────────────────────────
// Gọi khi: verify refresh token
const getRefreshToken = async (userId, tokenId) => {
  const key = makeKey(userId, tokenId);
  const data = await redis.hgetall(key);

  // hgetall trả {} nếu key không tồn tại
  if (!data || !data.token) return null;

  return data;
};

// ── Xóa 1 Refresh Token ───────────────────────────────
// Gọi khi: đăng xuất 1 thiết bị
const deleteRefreshToken = async (userId, tokenId) => {
  const key = makeKey(userId, tokenId);
  await redis.del(key);
};

// ── Xóa TẤT CẢ Refresh Token của 1 user ─────────────
// Gọi khi: đổi mật khẩu, bị hack, logout tất cả thiết bị
const deleteAllRefreshTokens = async (userId) => {
  // Tìm tất cả key của user này
  const pattern = `refresh_token:${userId}:*`;
  const keys = await redis.keys(pattern);

  if (keys.length > 0) {
    await redis.del(...keys); // xóa tất cả 1 lần
  }
};

// ── Lấy danh sách tất cả phiên đăng nhập ─────────────
// Gọi khi: user muốn xem đang đăng nhập ở đâu
const getAllSessions = async (userId) => {
  const pattern = `refresh_token:${userId}:*`;
  const keys = await redis.keys(pattern);

  if (keys.length === 0) return [];

  // Lấy thông tin từng session
  const sessions = await Promise.all(
    keys.map(async (key) => {
      const data = await redis.hgetall(key);
      const tokenId = key.split(":")[2]; // lấy tokenId từ key
      const ttl = await redis.ttl(key);
      return { tokenId, createdAt: data.createdAt, expiresIn: ttl };
    }),
  );

  return sessions;
};

module.exports = {
  saveRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  deleteAllRefreshTokens,
  getAllSessions,
};
