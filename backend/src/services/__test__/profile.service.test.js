jest.mock('../../models/UserProfile', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('fs', () => ({
  unlink: jest.fn((path, callback) => callback && callback()),
}));

const UserProfile = require('../../models/UserProfile');
const fs = require('fs');
const profileService = require('../../services/profile.service');

describe('profile.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfileService', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 1,
        user_id: 1,
        name: 'Test User',
        phone: '0123456789',
        toSafeObject: jest.fn(() => ({
          id: 1,
          user_id: 1,
          name: 'Test User',
          phone: '0123456789',
        })),
      };
      UserProfile.findOne.mockResolvedValue(mockProfile);

      const result = await profileService.getProfileService(1);

      expect(UserProfile.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toEqual(mockProfile);
    });

    it('should throw error when profile not found', async () => {
      UserProfile.findOne.mockResolvedValue(null);

      await expect(profileService.getProfileService(999)).rejects.toThrow(
        'Không tìm thấy profile'
      );
    });
  });

  describe('updateProfileService', () => {
    it('should update existing profile with name', async () => {
      const mockProfile = {
        id: 1,
        user_id: 1,
        name: 'Old Name',
        update: jest.fn().mockResolvedValue(true),
      };
      UserProfile.findOne.mockResolvedValue(mockProfile);

      const result = await profileService.updateProfileService(1, { name: 'New Name' });

      expect(mockProfile.update).toHaveBeenCalledWith({ name: 'New Name' });
      expect(result).toEqual(mockProfile);
    });

    it('should update profile with phone and gender', async () => {
      const mockProfile = {
        id: 1,
        user_id: 1,
        update: jest.fn().mockResolvedValue(true),
      };
      UserProfile.findOne.mockResolvedValue(mockProfile);

      await profileService.updateProfileService(1, { phone: '0987654321', gender: 'female' });

      expect(mockProfile.update).toHaveBeenCalledWith({
        phone: '0987654321',
        gender: 'female',
      });
    });

    it('should create new profile if not exists', async () => {
      const newProfile = {
        id: 2,
        user_id: 1,
        name: 'New User',
      };
      UserProfile.findOne.mockResolvedValue(null);
      UserProfile.create.mockResolvedValue(newProfile);

      const result = await profileService.updateProfileService(1, { name: 'New User' });

      expect(UserProfile.create).toHaveBeenCalledWith({
        user_id: 1,
        name: 'New User',
      });
      expect(result).toEqual(newProfile);
    });

    it('should update avatar when file is provided', async () => {
      const mockProfile = {
        id: 1,
        user_id: 1,
        avatar: null,
        update: jest.fn().mockResolvedValue(true),
      };
      const mockFile = { filename: 'new-avatar.png' };
      UserProfile.findOne.mockResolvedValue(mockProfile);

      await profileService.updateProfileService(1, {}, mockFile);

      expect(mockProfile.update).toHaveBeenCalledWith({
        avatar: '/uploads/avatars/new-avatar.png',
      });
    });

    it('should delete old avatar when uploading new one', async () => {
      const mockProfile = {
        id: 1,
        user_id: 1,
        avatar: '/uploads/avatars/old-avatar.png',
        update: jest.fn().mockResolvedValue(true),
      };
      const mockFile = { filename: 'new-avatar.png' };
      UserProfile.findOne.mockResolvedValue(mockProfile);

      await profileService.updateProfileService(1, {}, mockFile);

      expect(fs.unlink).toHaveBeenCalled();
    });
  });
});
