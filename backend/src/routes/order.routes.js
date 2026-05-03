const express = require('express');
const router = express.Router();

const {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
} = require('../controllers/order.controller');

const { authenticate } = require('../middlewares/auth.middleware');

// Tất cả routes đều cần authentication
router.use(authenticate);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng của user
 *     tags:
 *       - Orders
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get('/', getOrders);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipping_address_id
 *               - order_items
 *             properties:
 *               shipping_address_id:
 *                 type: integer
 *               billing_address_id:
 *                 type: integer
 *               order_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               notes:
 *                 type: string
 *               customer_notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo
 */
router.post('/', createOrder);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng
 *     tags:
 *       - Orders
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
 *         description: Chi tiết đơn hàng
 *       404:
 *         description: Đơn hàng không tồn tại
 */
router.get('/:id', getOrderById);

/**
 * @openapi
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Hủy đơn hàng
 *     tags:
 *       - Orders
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
 *         description: Đơn hàng đã được hủy
 *       400:
 *         description: Không thể hủy đơn hàng này
 */
router.put('/:id/cancel', cancelOrder);

module.exports = router;
