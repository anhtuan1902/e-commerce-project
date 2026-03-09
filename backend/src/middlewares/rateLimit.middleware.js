// src/middlewares/rateLimit.middleware.js
const redis = require("../config/redis");
const { errorResponse } = require("../utils/response.util");

const loginRateLimit = async (req, res, next) => {
  const ip = req.ip;
  const key = `rate_limit:login:${ip}`;
  const MAX = 5; // tối đa 5 lần
  const WINDOW = 60; // trong 60 giây

  const current = await redis.incr(key); // tăng đếm lên 1

  if (current === 1) {
    // Lần đầu gọi → set TTL 60 giây
    await redis.expire(key, WINDOW);
  }

  if (current > MAX) {
    const ttl = await redis.ttl(key);
    return errorResponse(
      res,
      `Quá nhiều lần thử. Vui lòng đợi ${ttl} giây`,
      429,
    );
  }

  next();
};

module.exports = { loginRateLimit };
