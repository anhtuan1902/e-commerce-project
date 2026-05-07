const express = require('express');
const router = express.Router();

const {
  createPayment,
  getPaymentById,
  getPaymentsByOrder,
  handleCallback,
  confirmCODPayment,
  rejectCODPayment,
  requestRefund,
  getPaymentMethods,
} = require('../controllers/payment.controller');

const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @openapi
 * /api/payments/methods:
 *   get:
 *     summary: Lấy danh sách phương thức thanh toán
 *     tags:
 *       - Payments
 *     responses:
 *       200:
 *         description: Danh sách payment methods
 */
router.get('/methods', getPaymentMethods);

/**
 * @openapi
 * /api/payments/callback/:gateway:
 *   post:
 *     summary: Callback từ payment gateway
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: path
 *         name: gateway
 *         required: true
 *         schema:
 *           type: string
 *           enum: [vnpay, momo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Kết quả xử lý callback
 */
router.post('/callback/:gateway', handleCallback);

/**
 * @openapi
 * /api/payments:
 *   post:
 *     summary: Tạo thanh toán mới
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - payment_method
 *             properties:
 *               order_id:
 *                 type: integer
 *                 description: ID của đơn hàng
 *               payment_method:
 *                 type: string
 *                 enum: [cod, vnpay, momo]
 *     responses:
 *       201:
 *         description: Thanh toán đã được tạo
 */
router.post('/', authenticate, createPayment);

/**
 * @openapi
 * /api/payments/order/:orderId:
 *   get:
 *     summary: Lấy danh sách thanh toán của một đơn hàng
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách thanh toán
 */
router.get('/order/:orderId', authenticate, getPaymentsByOrder);

/**
 * @openapi
 * /api/payments/:id:
 *   get:
 *     summary: Lấy chi tiết thanh toán
 *     tags:
 *       - Payments
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
 *         description: Chi tiết thanh toán
 */
router.get('/:id', authenticate, getPaymentById);

/**
 * @openapi
 * /api/payments/cod/confirm:
 *   post:
 *     summary: Xác nhận thanh toán COD
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: integer
 *               received_amount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã xác nhận thanh toán
 */
router.post('/cod/confirm', authenticate, confirmCODPayment);

/**
 * @openapi
 * /api/payments/cod/reject:
 *   post:
 *     summary: Từ chối thanh toán COD
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: integer
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã ghi nhận từ chối
 */
router.post('/cod/reject', authenticate, rejectCODPayment);

/**
 * @openapi
 * /api/payments/:id/refund:
 *   post:
 *     summary: Yêu cầu hoàn tiền
 *     tags:
 *       - Payments
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yêu cầu hoàn tiền đã được tạo
 */
router.post('/:id/refund', authenticate, requestRefund);

module.exports = router;
