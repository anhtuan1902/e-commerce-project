jest.mock('../../config/redis', () => ({
  hset: jest.fn(),
  hgetall: jest.fn(),
  expire: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  ttl: jest.fn(),
}));

const redis = require('../../config/redis');
const tokenService = require('../../services/token.service');

describe('token.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token with correct key and TTL', async () => {
      redis.hset.mockResolvedValue(1);
      redis.expire.mockResolvedValue(1);

      await tokenService.saveRefreshToken(1, 'token-123', 'refresh-token-value');

      expect(redis.hset).toHaveBeenCalledWith(
        'refresh_token:1:token-123',
        expect.objectContaining({
          token: 'refresh-token-value',
          userId: '1',
          createdAt: expect.any(String),
        })
      );
      expect(redis.expire).toHaveBeenCalledWith('refresh_token:1:token-123', 604800);
    });
  });

  describe('getRefreshToken', () => {
    it('should return token data when exists', async () => {
      const mockData = {
        token: 'refresh-token-value',
        userId: '1',
        createdAt: '2024-01-01T00:00:00.000Z',
      };
      redis.hgetall.mockResolvedValue(mockData);

      const result = await tokenService.getRefreshToken(1, 'token-123');

      expect(result).toEqual(mockData);
      expect(redis.hgetall).toHaveBeenCalledWith('refresh_token:1:token-123');
    });

    it('should return null when token does not exist', async () => {
      redis.hgetall.mockResolvedValue({});

      const result = await tokenService.getRefreshToken(1, 'token-123');

      expect(result).toBeNull();
    });

    it('should return null when redis returns null', async () => {
      redis.hgetall.mockResolvedValue(null);

      const result = await tokenService.getRefreshToken(1, 'token-123');

      expect(result).toBeNull();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete token with correct key', async () => {
      redis.del.mockResolvedValue(1);

      await tokenService.deleteRefreshToken(1, 'token-123');

      expect(redis.del).toHaveBeenCalledWith('refresh_token:1:token-123');
    });
  });

  describe('deleteAllRefreshTokens', () => {
    it('should delete all tokens for a user', async () => {
      const keys = ['refresh_token:1:token-1', 'refresh_token:1:token-2'];
      redis.keys.mockResolvedValue(keys);
      redis.del.mockResolvedValue(2);

      await tokenService.deleteAllRefreshTokens(1);

      expect(redis.keys).toHaveBeenCalledWith('refresh_token:1:*');
      expect(redis.del).toHaveBeenCalledWith(...keys);
    });

    it('should not call del when no tokens found', async () => {
      redis.keys.mockResolvedValue([]);

      await tokenService.deleteAllRefreshTokens(1);

      expect(redis.keys).toHaveBeenCalledWith('refresh_token:1:*');
      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('getAllSessions', () => {
    it('should return empty array when no sessions', async () => {
      redis.keys.mockResolvedValue([]);

      const result = await tokenService.getAllSessions(1);

      expect(result).toEqual([]);
    });

    it('should return sessions with token info', async () => {
      const keys = ['refresh_token:1:token-1'];
      const mockData = { createdAt: '2024-01-01T00:00:00.000Z' };
      redis.keys.mockResolvedValue(keys);
      redis.hgetall.mockResolvedValue(mockData);
      redis.ttl.mockResolvedValue(86400);

      const result = await tokenService.getAllSessions(1);

      expect(result).toEqual([
        {
          tokenId: 'token-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          expiresIn: 86400,
        },
      ]);
    });
  });
});
