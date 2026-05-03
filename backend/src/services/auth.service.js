const redis = require('../config/redis');
const sequelize = require('../database/sequelize');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Vendor = require('../models/Vendor');
const AppError = require('../utils/ApiError');
const { generateTokenPair, verifyRefreshToken, verifyAccessToken } = require('../utils/jwt.util');
const tokenService = require('./token.service');

const ALLOWED_ROLES = new Set(['customer', 'vendor']);

function resolveRole(role) {
  return ALLOWED_ROLES.has(role) ? role : 'customer';
}

async function assertEmailAvailable(email) {
  const exists = await User.findOne({ where: { email } });
  if (exists) throw new AppError('Email đã được sử dụng', 409);
}

async function assertPhoneAvailable(phone) {
  const exists = await UserProfile.findOne({ where: { phone } });
  if (exists) throw new AppError('Số điện thoại đã được sử dụng', 409);
}

async function issueTokens(user, transaction = null) {
  const { accessToken, refreshToken, tokenId } = generateTokenPair(user);
  const updateOptions = { where: { id: user.id } };
  if (transaction) updateOptions.transaction = transaction;

  await Promise.all([
    tokenService.saveRefreshToken(user.id, tokenId, refreshToken),
    User.update({ lastLoginAt: new Date() }, updateOptions),
  ]);
  return { accessToken, refreshToken };
}

function buildUserPayload(user, profile, vendor) {
  const payload = {
    user: user.toSafeObject(),
    profile: profile.toSafeObject(),
  };

  if (vendor && vendor.toSafeObject && vendor.toSafeObject()) {
    payload.vendor = vendor.toSafeObject();
  }

  return payload;
}

async function blacklistAction(accessToken) {
  if (accessToken) {
    const decoded = verifyAccessToken(accessToken);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000); // giây còn lại
    if (ttl > 0) {
      await redis.set(`blacklist:${accessToken}`, '1', 'EX', ttl);
    }
  }
}

const register = async ({ name, email, password, role, phone, birthday, gender, store_name }) => {
  await assertEmailAvailable(email);
  if (phone) await assertPhoneAvailable(phone);

  const transaction = await sequelize.transaction();
  try {
    const userRole = resolveRole(role);

    const user = await User.create(
      {
        email,
        password,
        role: userRole,
        isVerified: false,
        isActive: userRole !== 'vendor', // Vendor bị lock đến khi admin duyệt
      },
      { transaction },
    );

    const profile = await UserProfile.create(
      {
        user_id: user.id,
        name,
        phone,
        birthday,
        gender,
      },
      { transaction },
    );

    if (userRole === 'vendor') {
      const vendor = await Vendor.create(
        {
          user_id: user.id,
          store_name,
        },
        { transaction },
      );

      await transaction.commit();
      return {
        role: userRole,
        user: buildUserPayload(user, profile, vendor),
      };
    }

    const tokens = await issueTokens(user, transaction);
    await transaction.commit();

    return {
      role: userRole,
      user: buildUserPayload(user, profile),
      ...tokens,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const login = async ({ email, password }) => {
  const user = await User.scope('withPassword').findOne({
    where: { email },
    include: [{ model: UserProfile, as: 'profile' }],
  });
  if (!user) throw new AppError('Email hoặc mật khẩu không đúng', 401);
  if (!user.isActive) throw new AppError('Tài khoản đã bị khóa', 403);
  if (!user.password) throw new AppError('Tài khoản này đăng nhập bằng Google', 400);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Email hoặc mật khẩu không đúng', 401);

  const { accessToken, refreshToken, tokenId } = generateTokenPair(user);

  // Lưu vào Redis
  await tokenService.saveRefreshToken(user.id, tokenId, refreshToken);
  await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

  const userData = user.toSafeObject();
  userData.profile = user.profile.toSafeObject();

  return {
    user: userData,
    accessToken,
    refreshToken,
  };
};

const logout = async (accessToken, refreshToken) => {
  const { userId, tokenId } = verifyRefreshToken(refreshToken);
  await tokenService.deleteRefreshToken(userId, tokenId);

  // Blacklist accessToken với TTL = thời gian còn lại của token
  if (accessToken) {
    await blacklistAction(accessToken);
  }
};

const logoutAll = async (accessToken, userId) => {
  await tokenService.deleteAllRefreshTokens(userId);

  // Blacklist accessToken hiện tại
  if (accessToken) {
    await blacklistAction(accessToken);
  }
};

const refreshToken = async (rawToken) => {
  // Bước 1: Verify chữ ký JWT
  // verifyRefreshToken nên throw AppError luôn nếu invalid/expired
  const { id: userId, tokenId } = verifyRefreshToken(rawToken);

  // Bước 2 + 3: Lấy token từ Redis và kiểm tra trong một bước
  const stored = await tokenService.getRefreshToken(userId, tokenId);

  if (!stored) {
    throw new AppError('Refresh token không hợp lệ', 401);
  }

  if (stored.token !== rawToken) {
    // Reuse detection: token cũ đang bị dùng lại → có thể bị đánh cắp
    // Revoke toàn bộ session của user
    await tokenService.deleteAllRefreshTokens(userId);
    throw new AppError('Phát hiện token bị đánh cắp. Vui lòng đăng nhập lại', 401);
  }

  // Bước 4: Validate user trước khi rotate — fail sớm, tránh tạo token thừa
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User không tồn tại', 404);
  if (!user.isActive) throw new AppError('Tài khoản đã bị khóa', 403);

  // Bước 5: Rotate — xóa cũ, cấp mới (atomic nếu có thể)
  await tokenService.deleteRefreshToken(userId, tokenId);
  return issueTokens(user);
};

const googleCallback = async (user) => {
  const { accessToken, refreshToken, tokenId } = generateTokenPair(user);

  // Lưu vào Redis
  await tokenService.saveRefreshToken(user.id, tokenId, refreshToken);
  await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

  return {
    accessToken,
    refreshToken,
  };
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      { model: UserProfile, as: 'profile' },
      {
        model: Vendor,
        as: 'vendor',
      },
    ],
  });
  if (!user) throw new AppError('Không tìm thấy user', 404);

  const userData = user.toSafeObject();
  // Thêm profile information
  userData.profile = user.profile.toSafeObject();

  return userData;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.scope('withPassword').findByPk(userId);
  if (!user) throw new AppError('Không tìm thấy user', 404);

  // Nếu không phải Google user, kiểm tra mật khẩu hiện tại
  if (!user.googleId && currentPassword) {
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError('Mật khẩu hiện tại không đúng', 400);
  }

  user.password = newPassword;
  await user.save();

  // Đổi mật khẩu xong thì revoke tất cả refresh token cũ
  await tokenService.deleteAllRefreshTokens(userId);
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  changePassword,
  getMe,
  refreshToken,
  googleCallback,
};
