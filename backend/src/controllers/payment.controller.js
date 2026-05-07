const { getPaymentService } = require('../services/payment');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { successResponse, errorResponse } = require('../utils/response.util');

const SUPPORTED_METHODS = ['cod', 'vnpay', 'momo'];

// ─────────────────────────────────────────────────────
// TẠO THANH TOÁN — POST /api/payments
// ─────────────────────────────────────────────────────
const createPayment = async (req, res) => {
  try {
    const { order_id, payment_method } = req.body;
    const { id: userId } = req.user;

    console.log('[Payment] Create payment request:', { order_id, payment_method, userId });

    if (!order_id || !payment_method) {
      return errorResponse(res, 'Vui lòng cung cấp order_id và payment_method', 400);
    }

    const method = payment_method.toLowerCase();
    console.log('[Payment] Payment method:', method, 'Supported:', SUPPORTED_METHODS);
    
    if (!SUPPORTED_METHODS.includes(method)) {
      return errorResponse(res, `Payment method không hỗ trợ. Chỉ chấp nhận: ${SUPPORTED_METHODS.join(', ')}`, 400);
    }

    // Find order
    const order = await Order.findOne({ where: { id: order_id, user_id: userId } });
    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);

    console.log('[Payment] Order found:', order.order_number, 'payment_status:', order.payment_status);

    if (order.payment_status === 'paid') {
      return errorResponse(res, 'Đơn hàng đã được thanh toán', 400);
    }

    const paymentService = getPaymentService(method);
    console.log('[Payment] Using service:', paymentService.gatewayName);
    
    const result = await paymentService.createPayment({ order, user: req.user, req });

    return successResponse(res, result, 'Tạo thanh toán thành công', 201);
  } catch (error) {
    console.error('[Payment] Create payment error:', error);
    return errorResponse(res, error.message || 'Lỗi khi tạo thanh toán');
  }
};

// ─────────────────────────────────────────────────────
// LẤY CHI TIẾT THANH TOÁN — GET /api/payments/:id
// ─────────────────────────────────────────────────────
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const payment = await Payment.findOne({
      where: { id },
      include: [{ model: Order, as: 'order', where: { user_id: userId } }],
    });

    if (!payment) return errorResponse(res, 'Không tìm thấy thanh toán', 404);

    return successResponse(res, payment);
  } catch (error) {
    console.error('[Payment] Get payment error:', error);
    return errorResponse(res, 'Lỗi khi lấy thông tin thanh toán');
  }
};

// ─────────────────────────────────────────────────────
// LẤY THANH TOÁN THEO ORDER — GET /api/payments/order/:orderId
// ─────────────────────────────────────────────────────
const getPaymentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { id: userId } = req.user;

    const order = await Order.findOne({ where: { id: orderId, user_id: userId } });
    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);

    const payments = await Payment.findAll({
      where: { order_id: orderId },
      order: [['created_at', 'DESC']],
    });

    return successResponse(res, payments);
  } catch (error) {
    console.error('[Payment] Get payments by order error:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách thanh toán');
  }
};

// ─────────────────────────────────────────────────────
// CALLBACK TỪ GATEWAY — POST /api/payments/callback/:gateway
// ─────────────────────────────────────────────────────
const handleCallback = async (req, res) => {
  try {
    const { gateway } = req.params;
    const callbackData = req.body;

    console.log(`[Payment] Callback from ${gateway}:`, callbackData);

    const paymentService = getPaymentService(gateway);

    // Verify signature
    if (!paymentService.verifyCallback(callbackData)) {
      console.error(`[Payment] Invalid signature from ${gateway}`);
      return errorResponse(res, 'Invalid signature', 400);
    }

    // Extract transaction ID (vnp_TxnRef for VNPay, transId for MoMo)
    const transactionId = callbackData.vnp_TxnRef || callbackData.transId;

    // Find payment by transaction ID to get order_id
    const payment = await Payment.findOne({
      where: { transaction_id: transactionId },
    });

    if (!payment) {
      console.error(`[Payment] Payment not found for transaction: ${transactionId}`);
      return errorResponse(res, 'Payment not found', 404);
    }

    // Handle success/failure based on gateway response
    const isSuccess =
      callbackData.resultCode === 0 ||
      callbackData.vnp_ResponseCode === '00';

    if (isSuccess) {
      await paymentService.handleSuccess({
        ...callbackData,
        orderId: payment.order_id,
      });
    } else {
      await paymentService.handleFailure({
        ...callbackData,
        orderId: payment.order_id,
        failureReason: callbackData.message || callbackData.vnp_ResponseCode,
      });
    }

    // Redirect về frontend
    const redirectUrl = `${process.env.FRONTEND_URL}/payment/${gateway}/${isSuccess ? 'success' : 'failure'}?orderId=${payment.order_id}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('[Payment] Callback error:', error);
    return errorResponse(res, 'Lỗi xử lý callback');
  }
};

// ─────────────────────────────────────────────────────
// XÁC NHẬN COD — POST /api/payments/cod/confirm
// ─────────────────────────────────────────────────────
const confirmCODPayment = async (req, res) => {
  try {
    const { order_id, received_amount, notes } = req.body;

    if (!order_id) return errorResponse(res, 'Vui lòng cung cấp order_id', 400);

    // Verify order belongs to user or is admin
    const order = await Order.findByPk(order_id);
    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);

    // TODO: Uncomment when auth middleware provides role
    // if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    //   return errorResponse(res, 'Không có quyền', 403);
    // }

    const paymentService = getPaymentService('cod');
    const result = await paymentService.confirmPayment({
      orderId: order_id,
      transactionId: null,
      receivedAmount: received_amount,
      notes,
    });

    return successResponse(res, result, 'Đã xác nhận thanh toán COD');
  } catch (error) {
    console.error('[Payment] Confirm COD error:', error);
    return errorResponse(res, error.message || 'Lỗi khi xác nhận thanh toán');
  }
};

// ─────────────────────────────────────────────────────
// TỪ CHỐI COD — POST /api/payments/cod/reject
// ─────────────────────────────────────────────────────
const rejectCODPayment = async (req, res) => {
  try {
    const { order_id, reason, notes } = req.body;

    if (!order_id) return errorResponse(res, 'Vui lòng cung cấp order_id', 400);

    const order = await Order.findByPk(order_id);
    if (!order) return errorResponse(res, 'Không tìm thấy đơn hàng', 404);

    const paymentService = getPaymentService('cod');
    const result = await paymentService.rejectPayment({
      orderId: order_id,
      transactionId: null,
      reason,
      notes,
    });

    return successResponse(res, result, 'Đã ghi nhận từ chối thanh toán COD');
  } catch (error) {
    console.error('[Payment] Reject COD error:', error);
    return errorResponse(res, error.message || 'Lỗi khi xử lý từ chối');
  }
};

// ─────────────────────────────────────────────────────
// YÊU CẦU HOÀN TIỀN — POST /api/payments/:id/refund
// ─────────────────────────────────────────────────────
const requestRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'Vui lòng cung cấp số tiền hoàn hợp lệ', 400);
    }

    const payment = await Payment.findByPk(id);
    if (!payment) return errorResponse(res, 'Không tìm thấy thanh toán', 404);

    const paymentService = getPaymentService(payment.payment_gateway);
    const result = await paymentService.requestRefund(payment, amount, reason);

    return successResponse(res, result);
  } catch (error) {
    console.error('[Payment] Refund error:', error);
    return errorResponse(res, error.message || 'Lỗi khi yêu cầu hoàn tiền');
  }
};

// ─────────────────────────────────────────────────────
// LẤY DANH SÁCH PHƯƠNG THỨC — GET /api/payments/methods
// ─────────────────────────────────────────────────────
const getPaymentMethods = async (req, res) => {
  try {
    const methods = [
      {
        code: 'cod',
        name: 'Thanh toán khi nhận hàng (COD)',
        description: 'Thanh toán bằng tiền mặt khi nhận được hàng',
        icon: 'cash',
        enabled: true,
      },
      {
        code: 'vnpay',
        name: 'Thanh toán qua VNPay',
        description: 'Thanh toán qua ngân hàng VNPay',
        icon: 'credit-card',
        enabled: !!(process.env.VNP_TMN_CODE && process.env.VNP_HASH_SECRET),
      },
      {
        code: 'momo',
        name: 'Thanh toán qua MoMo',
        description: 'Thanh toán bằng ví MoMo',
        icon: 'wallet',
        enabled: !!(
          process.env.MOMO_PARTNER_CODE &&
          process.env.MOMO_ACCESS_KEY &&
          process.env.MOMO_PARTNER_CODE !== 'YOUR_PARTNER_CODE'
        ),
      },
    ];

    return successResponse(res, methods);
  } catch (error) {
    console.error('[Payment] Get methods error:', error);
    return errorResponse(res, 'Lỗi khi lấy danh sách phương thức');
  }
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByOrder,
  handleCallback,
  confirmCODPayment,
  rejectCODPayment,
  requestRefund,
  getPaymentMethods,
};
