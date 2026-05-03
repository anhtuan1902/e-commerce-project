const { successResponse, errorResponse } = require('../utils/response.util');
const profileService = require('../services/profile.service');
const fs = require('fs');
const AppError = require('../utils/ApiError');

// ─────────────────────────────────────────────────────
// LẤY PROFILE CỦA CHÍNH MÌNH — GET /api/profiles/me
// ─────────────────────────────────────────────────────
const getProfileController = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await profileService.getProfileService(userId);
    return successResponse(res, result, 'Lấy profile thành công');
  } catch (error) {
    return errorResponse(res, 'Lỗi server: ' + error.message, '500', 500);
  }
};

// ─────────────────────────────────────────────────────
// CẬP NHẬT PROFILE CỦA CHÍNH MÌNH — PUT /api/profiles/me
// ─────────────────────────────────────────────────────
const updateProfileController = async (req, res) => {
  try {
    const profile = await profileService.updateProfileService(req.user.id, req.body, req.file);
    return successResponse(res, profile, 'Cập nhật profile thành công');
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    if (error instanceof AppError) return errorResponse(res, error.message, error.statusCode);
    console.error(error);
    return errorResponse(res, 'Lỗi server');
  }
};

module.exports = {
  getProfileController,
  updateProfileController,
};
