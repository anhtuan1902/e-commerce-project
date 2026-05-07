const BasePaymentService = require('./base.payment.service');

/**
 * COD (Cash on Delivery) Payment Service
 * Thanh toán khi nhận hàng - không cần tích hợp gateway bên ngoài
 */
class CODService extends BasePaymentService {
  constructor() {
    super();
    this.gatewayName = 'COD';
  }

  /**
   * Tạo thanh toán COD
   * COD không cần tạo URL thanh toán, chỉ cần tạo payment record
   * @param {Object} params
   * @param {Object} params.order - Order object
   * @param {Object} params.user - User object
   * @returns {Promise<{success: boolean, payment: Payment, message: string}>}
   */
  async createPayment(params) {
    const { order, user } = params;

    // Validate amount
    if (!this.validateAmount(order.total_amount)) {
      throw new Error('Invalid payment amount');
    }

    // Generate transaction ID
    const transactionId = this.generateTransactionId('COD');

    // Create payment record
    const payment = await this.createPaymentRecord({
      orderId: order.id,
      paymentMethod: 'cash_on_delivery',
      gateway: 'cod',
      amount: order.total_amount,
      transactionId,
      status: 'pending',
    });

    console.log(`[COD] Payment record created for order ${order.order_number}`);

    return {
      success: true,
      payment,
      transactionId,
      paymentUrl: null, // COD không có payment URL
      message: 'Đơn hàng đã được tạo. Bạn sẽ thanh toán khi nhận hàng.',
    };
  }

  /**
   * Xác thực callback - COD không có callback từ gateway
   * @param {Object} callbackData
   * @returns {boolean}
   */
  verifyCallback(callbackData) {
    // COD không cần verify callback
    // Luôn trả về true vì không có gateway bên ngoài
    return true;
  }

  /**
   * Xử lý khi nhận được xác nhận thanh toán COD
   * Thường được gọi khi đơn hàng được giao thành công
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async confirmPayment(params) {
    const { orderId, transactionId, receivedAmount, notes } = params;

    return await this.handleSuccess({
      orderId,
      transactionId,
      amount: receivedAmount,
      gatewayResponse: {
        confirmedAt: new Date(),
        notes,
        paymentConfirmedBy: 'delivery_staff',
      },
    });
  }

  /**
   * Xử lý khi thanh toán COD thất bại/bị từ chối
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async rejectPayment(params) {
    const { orderId, transactionId, reason, notes } = params;

    return await this.handleFailure({
      orderId,
      transactionId,
      failureReason: reason || 'Khách hàng từ chối thanh toán khi nhận hàng',
      gatewayResponse: {
        rejectedAt: new Date(),
        notes,
        paymentRejectedBy: 'delivery_staff',
      },
    });
  }

  /**
   * Yêu cầu hoàn tiền - COD chỉ có thể hoàn tiền thủ công
   * @param {Object} payment - Payment record
   * @param {number} amount - Số tiền hoàn
   * @param {string} reason - Lý do hoàn tiền
   * @returns {Promise<Object>}
   */
  async requestRefund(payment, amount, reason) {
    // Validate refund
    const validation = this.validateRefund(payment, amount);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // COD refund cần xử lý thủ công
    // Cập nhật payment status
    const updatedPayment = await payment.processRefund(amount, reason);

    console.log(`[COD] Refund requested for payment ${payment.id}, amount: ${this.formatCurrency(amount)}`);

    return {
      success: true,
      payment: updatedPayment,
      message: `Yêu cầu hoàn tiền COD đã được tạo. Số tiền: ${this.formatCurrency(amount)}. Vui lòng xử lý hoàn tiền thủ công.`,
      requiresManualAction: true,
    };
  }

  /**
   * Xác thực callback hoàn tiền - COD không có
   * @param {Object} callbackData
   * @returns {boolean}
   */
  verifyRefundCallback(callbackData) {
    return true;
  }

  /**
   * Tạo thông tin thanh toán để hiển thị cho khách hàng
   * @param {Object} order - Order object
   * @returns {Object}
   */
  getPaymentInstructions(order) {
    return {
      method: 'COD',
      title: 'Thanh toán khi nhận hàng (COD)',
      instructions: [
        'Đơn hàng sẽ được giao đến địa chỉ bạn đã đăng ký',
        'Vui lòng thanh toán bằng tiền mặt cho nhân viên giao hàng',
        'Kiểm tra kỹ sản phẩm trước khi thanh toán',
        'Liên hệ hotline nếu cần hỗ trợ',
      ],
      amount: this.formatCurrency(order.total_amount),
      orderNumber: order.order_number,
    };
  }
}

module.exports = new CODService();
