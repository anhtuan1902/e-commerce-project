const express = require('express');
const router = express.Router();

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist,
} = require('../controllers/wishlist.controller');

const { authenticate } = require('../middlewares/auth.middleware');

// Tất cả routes đều cần authentication
router.use(authenticate);

/**
 * @openapi
 * /api/wishlist:
 *   get:
 *     summary: Lấy danh sách wishlist của user
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm trong wishlist
 */
router.get('/', getWishlist);

/**
 * @openapi
 * /api/wishlist:
 *   post:
 *     summary: Thêm sản phẩm vào wishlist
 *     tags:
 *       - Wishlist
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
 *             properties:
 *               product_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sản phẩm đã được thêm vào wishlist
 *       409:
 *         description: Sản phẩm đã có trong wishlist
 */
router.post('/', addToWishlist);

/**
 * @openapi
 * /api/wishlist/{product_id}:
 *   delete:
 *     summary: Xóa sản phẩm khỏi wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sản phẩm đã được xóa khỏi wishlist
 *       404:
 *         description: Sản phẩm không có trong wishlist
 */
router.delete('/:product_id', removeFromWishlist);

/**
 * @openapi
 * /api/wishlist/check/{product_id}:
 *   get:
 *     summary: Kiểm tra sản phẩm có trong wishlist không
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra
 */
router.get('/check/:product_id', checkInWishlist);

module.exports = router;
