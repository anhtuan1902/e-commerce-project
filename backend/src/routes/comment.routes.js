const express = require('express');
const router = express.Router();

const {
  getCommentsByProduct,
  getReplies,
  createComment,
  updateComment,
  deleteComment,
  markHelpful,
  moderateComment,
} = require('../controllers/comment.controller');

const { authenticate } = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

/**
 * @openapi
 * /api/comments/product/{productId}:
 *   get:
 *     summary: Lấy comments của sản phẩm
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: Danh sách comments
 */
router.get('/product/:productId', getCommentsByProduct);

/**
 * @openapi
 * /api/comments/{id}/replies:
 *   get:
 *     summary: Lấy replies của comment
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách replies
 */
router.get('/:id/replies', getReplies);

// Protected routes - cần đăng nhập
router.use(authenticate);

/**
 * @openapi
 * /api/comments:
 *   post:
 *     summary: Tạo comment mới
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - content
 *             properties:
 *               product_id:
 *                 type: integer
 *               content:
 *                 type: string
 *               rating_id:
 *                 type: integer
 *               parent_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Comment đã được tạo
 */
router.post('/', createComment);

/**
 * @openapi
 * /api/comments/{id}:
 *   put:
 *     summary: Cập nhật comment
 *     tags:
 *       - Comments
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
 *         description: Comment đã được cập nhật
 */
router.put('/:id', updateComment);

/**
 * @openapi
 * /api/comments/{id}:
 *   delete:
 *     summary: Xóa comment
 *     tags:
 *       - Comments
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
 *         description: Comment đã được xóa
 */
router.delete('/:id', deleteComment);

/**
 * @openapi
 * /api/comments/{id}/helpful:
 *   post:
 *     summary: Đánh dấu comment hữu ích
 *     tags:
 *       - Comments
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
 *         description: Đã đánh dấu hữu ích
 */
router.post('/:id/helpful', markHelpful);

/**
 * @openapi
 * /api/comments/{id}/moderate:
 *   put:
 *     summary: Phê duyệt/ẩn comment (Admin only)
 *     tags:
 *       - Comments
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
 *             required:
 *               - is_approved
 *             properties:
 *               is_approved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái comment
 */
router.put('/:id/moderate', requireRole('admin'), moderateComment);

module.exports = router;
