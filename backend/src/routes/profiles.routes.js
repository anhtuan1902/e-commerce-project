const express = require('express');
const router = express.Router();
const {
  getProfileController,
  updateProfileController,
} = require('../controllers/profiles.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { updateUserProfileSchema } = require('../validations');
const upload = require('../middlewares/upload.middleware');

// Tất cả routes đều cần authentication
router.use(authenticate);

/**
 * @swagger
 * /api/profiles/me:
 *   get:
 *     summary: Lấy profile của chính mình
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     avatar:
 *                       type: string
 *                       format: uri
 *                     phone:
 *                       type: string
 *                     birthday:
 *                       type: string
 *                       format: date
 *                     gender:
 *                       type: string
 *                       enum: [male, female, other]
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
router.get('/me', getProfileController);

/**
 * @swagger
 * /api/profiles/me:
 *   put:
 *     summary: Cập nhật profile của chính mình
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 nullable: true
 *               birthday:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               gender:
 *                 type: string
 *                 nullable: true
 *                 enum: [male, female, other]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       409:
 *         description: Số điện thoại đã được sử dụng
 *       500:
 *         description: Lỗi server
 */
router.put(
  '/me',
  upload.single('avatar'),
  validateBody(updateUserProfileSchema),
  updateProfileController,
);

module.exports = router;
