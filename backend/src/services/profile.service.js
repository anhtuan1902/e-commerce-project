const UserProfile = require('../models/UserProfile');
const AppError = require('../utils/ApiError');
const fs = require('fs');
const path = require('path');

const getProfileService = async (userId) => {
  const profile = await UserProfile.findOne({
    where: { user_id: userId },
  });

  if (!profile) throw new AppError('Không tìm thấy profile', 404);

  return profile;
};

const updateProfileService = async (userId, body, file) => {
  const { phone, name, birthday, gender } = body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (birthday !== undefined) updateData.birthday = birthday;
  if (gender !== undefined) updateData.gender = gender;

  if (file) {
    updateData.avatar = `/uploads/avatars/${file.filename}`;
  }

  let profile = await UserProfile.findOne({ where: { user_id: userId } });

  if (profile) {
    // Xóa avatar cũ nếu có upload ảnh mới
    if (file && profile.avatar) {
      const oldPath = path.join('src', profile.avatar);
      fs.unlink(oldPath, () => {}); // bỏ qua lỗi nếu file không tồn tại
    }

    await profile.update(updateData);
  } else {
    profile = await UserProfile.create({ user_id: userId, ...updateData });
  }

  return profile;
};

module.exports = {
  getProfileService,
  updateProfileService,
};
