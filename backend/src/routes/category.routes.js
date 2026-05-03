const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');

const { authenticate } = require('../middlewares/auth.middleware');

// Tất cả routes đều cần authentication

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách danh mục
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: integer
 *           description: ID của danh mục cha, null để lấy danh mục gốc
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 */
router.get('/', getCategories);

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     summary: Lấy chi tiết danh mục
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết danh mục
 *       404:
 *         description: Danh mục không tồn tại
 */
router.get('/:id', getCategoryById);

router.use(authenticate);

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Tạo danh mục mới (Admin only)
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *               image:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *                 default: true
 *               sort_order:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Danh mục đã được tạo
 */
router.post('/', createCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     summary: Cập nhật danh mục (Admin only)
 *     tags:
 *       - Categories
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
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *               image:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Danh mục đã được cập nhật
 */
router.put('/:id', updateCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Xóa danh mục (Admin only)
 *     tags:
 *       - Categories
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
 *         description: Danh mục đã được xóa
 */
router.delete('/:id', deleteCategory);

module.exports = router;
