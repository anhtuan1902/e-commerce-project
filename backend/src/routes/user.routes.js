const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfile,
} = require('../controllers/user.controller');

const { authenticate } = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

// Tất cả routes đều cần authentication
router.use(authenticate);

// ─────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────
/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lấy danh sách users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, vendor, customer]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Danh sách users
 */
router.get('/', requireRole('admin'), getUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Lấy chi tiết user (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết user
 *       404:
 *         description: User không tồn tại
 */
router.get('/:id', requireRole('admin'), getUserById);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật user (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, vendor, customer]
 *               isActive:
 *                 type: boolean
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User đã được cập nhật
 */
router.put('/:id', requireRole('admin'), updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa user (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User đã được xóa
 */
router.delete('/:id', requireRole('admin'), deleteUser);

// ─────────────────────────────────────────────────────
// USER PROFILE ROUTES
// ─────────────────────────────────────────────────────
/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     summary: Cập nhật profile của chính mình
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile đã được cập nhật
 */
router.put('/profile', updateProfile);

module.exports = router;
