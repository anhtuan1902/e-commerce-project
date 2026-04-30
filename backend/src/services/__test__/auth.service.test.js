jest.mock('../../config/redis', () => ({ set: jest.fn() }));

jest.mock('../../database/sequelize', () => ({
  transaction: jest.fn(() => ({
    commit: jest.fn(),
    rollback: jest.fn(),
  })),
}));

jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  scope: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock('../../models/UserProfile', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../models/Vendor', () => ({
  create: jest.fn(),
}));

jest.mock('../../utils/jwt.util', () => ({
  generateTokenPair: jest.fn(),
  verifyRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
}));

jest.mock('../token.service', () => ({
  saveRefreshToken: jest.fn(),
  getRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
  deleteAllRefreshTokens: jest.fn(),
  getAllSessions: jest.fn(),
}));

const sequelize = require('../../database/sequelize');
const User = require('../../models/User');
const UserProfile = require('../../models/UserProfile');
const tokenService = require('../token.service');
const jwtUtil = require('../../utils/jwt.util');
const AppError = require('../../utils/ApiError');
const { register, login } = require('../auth.service');

describe('auth.service', () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    sequelize.transaction.mockResolvedValue(mockTransaction);
    User.scope.mockReturnValue(User);
  });

  describe('register', () => {
    it('should register a new customer and return tokens with safe user data', async () => {
      const payload = {
        name: 'Nguyen Van A',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        phone: '0123456789',
        birthday: '1990-01-01',
        gender: 'male',
      };

      User.findOne.mockResolvedValue(null);
      UserProfile.findOne.mockResolvedValue(null);

      const createdUser = {
        id: 1,
        email: payload.email,
        role: 'customer',
        toSafeObject: jest.fn(() => ({ id: 1, email: payload.email, role: 'customer' })),
      };
      const createdProfile = {
        toSafeObject: jest.fn(() => ({
          name: payload.name,
          phone: payload.phone,
          birthday: payload.birthday,
          gender: payload.gender,
        })),
      };

      User.create.mockResolvedValue(createdUser);
      UserProfile.create.mockResolvedValue(createdProfile);
      User.update.mockResolvedValue([1]);
      jwtUtil.generateTokenPair.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenId: 'token-id',
      });

      const result = await register(payload);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: payload.email } });
      expect(UserProfile.findOne).toHaveBeenCalledWith({ where: { phone: payload.phone } });
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(UserProfile.create).toHaveBeenCalledTimes(1);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({
        role: 'customer',
        user: {
          user: {
            id: 1,
            email: payload.email,
            role: 'customer',
          },
          profile: {
            name: payload.name,
            phone: payload.phone,
            birthday: payload.birthday,
            gender: payload.gender,
          },
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw an AppError when the email is already in use', async () => {
      User.findOne.mockResolvedValue({ id: 999, email: 'test@example.com' });

      await expect(
        register({
          name: 'Nguyen Van B',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'customer',
          phone: '0123456789',
          birthday: '1990-01-01',
          gender: 'male',
        }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('should log in an active user and return user data with tokens', async () => {
      const payload = { email: 'user@example.com', password: 'Password123!' };
      const userRecord = {
        id: 2,
        email: payload.email,
        isActive: true,
        password: 'hashed-password',
        profile: {
          toSafeObject: jest.fn(() => ({ name: 'User Name' })),
        },
        comparePassword: jest.fn().mockResolvedValue(true),
        toSafeObject: jest.fn(() => ({ id: 2, email: payload.email })),
      };

      User.findOne.mockResolvedValue(userRecord);
      jwtUtil.generateTokenPair.mockReturnValue({
        accessToken: 'login-access-token',
        refreshToken: 'login-refresh-token',
        tokenId: 'login-token-id',
      });
      User.update.mockResolvedValue([1]);

      const result = await login(payload);

      expect(User.scope).toHaveBeenCalledWith('withPassword');
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: payload.email },
        include: [{ model: UserProfile, as: 'profile' }],
      });
      expect(userRecord.comparePassword).toHaveBeenCalledWith(payload.password);
      expect(tokenService.saveRefreshToken).toHaveBeenCalledWith(
        2,
        'login-token-id',
        'login-refresh-token',
      );
      expect(User.update).toHaveBeenCalledWith(
        { lastLoginAt: expect.any(Date) },
        { where: { id: 2 } },
      );
      expect(result).toEqual({
        user: {
          id: 2,
          email: payload.email,
          profile: { name: 'User Name' },
        },
        accessToken: 'login-access-token',
        refreshToken: 'login-refresh-token',
      });
    });

    it('should throw an AppError when the password is invalid', async () => {
      const payload = { email: 'user@example.com', password: 'WrongPassword' };
      const userRecord = {
        id: 3,
        email: payload.email,
        isActive: true,
        password: 'hashed-password',
        profile: {
          toSafeObject: jest.fn(() => ({ name: 'User Name' })),
        },
        comparePassword: jest.fn().mockResolvedValue(false),
        toSafeObject: jest.fn(() => ({ id: 3, email: payload.email })),
      };

      User.findOne.mockResolvedValue(userRecord);

      await expect(login(payload)).rejects.toThrow(AppError);
      expect(userRecord.comparePassword).toHaveBeenCalledWith(payload.password);
    });
  });
});
