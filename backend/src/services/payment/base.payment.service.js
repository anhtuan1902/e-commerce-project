const sequelize = require('../../database/sequelize');
const Payment = require('../../models/Payment');
const Order = require('../../models/Order');

/**
 * Base Payment Service
 * Abstract class định nghĩa interface chuẩn cho tất cả payment gateways
 */
class BasePaymentService {
  constructor() {
    if (this.constructor === BasePaymentService) {
      throw new Error('BasePaymentService is abstract and cannot be instantiated directly');
    }
    
    this.gatewayName = null;
  }

  // ========== ABSTRACT METHODS - Override in child classes ==========

  /**
   * Tạo thanh toán - Implement theo từng gateway
   * @param {Object} params - Thông tin thanh toán
   * @returns {Promise<{success: boolean, paymentUrl?: string, qrCode?: string, transactionId: string}>}
   */
  async createPayment(params) {
    throw new Error('Must implement createPayment()');
  }

  /**
   * Xác thực callback từ gateway - Implement theo từng gateway
   * @param {Object} callbackData - Data từ gateway callback
   * @returns {boolean}
   */
  verifyCallback(callbackData) {
    throw new Error('Must implement verifyCallback()');
  }

  /**
   * Xử lý callback thành công - Override nếu cần custom logic
   * @param {Object} callbackData - Data từ gateway
   * @returns {Promise<Object>}
   */
  async handleSuccess(callbackData) {
    const { orderId, transactionId, amount, gatewayResponse } = callbackData;
    
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Update Payment record
      const payment = await Payment.findOne({
        where: { order_id: orderId },
        transaction,
      });

      if (!payment) {
        throw new Error(`Payment not found for order ${orderId}`);
      }

      await payment.update(
        {
          status: 'completed',
          transaction_id: transactionId,
          payment_date: new Date(),
          gateway_response: gatewayResponse || callbackData,
        },
        { transaction }
      );

      // 2. Update Order payment_status
      const order = await Order.findByPk(orderId, { transaction });
      if (order) {
        await order.update(
          { payment_status: 'paid' },
          { transaction }
        );
      }

      await transaction.commit();

      console.log(`[${this.gatewayName}] Payment completed for order ${orderId}, transaction: ${transactionId}`);

      return {
        success: true,
        payment,
        order,
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${this.gatewayName}] Error handling success for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Xử lý callback thất bại - Override nếu cần custom logic
   * @param {Object} callbackData - Data từ gateway
   * @returns {Promise<Object>}
   */
  async handleFailure(callbackData) {
    const { orderId, transactionId, failureReason, gatewayResponse } = callbackData;
    
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Update Payment record
      const payment = await Payment.findOne({
        where: { order_id: orderId },
        transaction,
      });

      if (payment) {
        await payment.update(
          {
            status: 'failed',
            transaction_id: transactionId || null,
            failure_reason: failureReason || 'Payment failed',
            gateway_response: gatewayResponse || callbackData,
          },
          { transaction }
        );
      }

      // 2. Update Order payment_status
      const order = await Order.findByPk(orderId, { transaction });
      if (order) {
        await order.update(
          { payment_status: 'failed' },
          { transaction }
        );
      }

      await transaction.commit();

      console.log(`[${this.gatewayName}] Payment failed for order ${orderId}: ${failureReason}`);

      return {
        success: false,
        error: failureReason,
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`[${this.gatewayName}] Error handling failure for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Yêu cầu hoàn tiền - Implement theo từng gateway
   * @param {Object} payment - Payment record
   * @param {number} amount - Số tiền muốn hoàn
   * @param {string} reason - Lý do hoàn tiền
   * @returns {Promise<Object>}
   */
  async requestRefund(payment, amount, reason) {
    throw new Error('Must implement requestRefund()');
  }

  /**
   * Xác thực callback hoàn tiền - Implement theo từng gateway
   * @param {Object} callbackData - Data từ gateway
   * @returns {boolean}
   */
  verifyRefundCallback(callbackData) {
    throw new Error('Must implement verifyRefundCallback()');
  }

  // ========== COMMON UTILITIES - Dùng chung cho tất cả gateways ==========

  /**
   * Tạo transaction ID unique
   * @param {string} prefix - Prefix cho transaction ID (default: TXN)
   * @returns {string}
   */
  generateTransactionId(prefix = 'TXN') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Tạo order info string cho gateway
   * @param {Object} order - Order object
   * @returns {string}
   */
  generateOrderInfo(order) {
    return `Thanh toan don hang ${order.order_number} - ${this.formatCurrency(order.total_amount)} VND`;
  }

  /**
   * Validate số tiền thanh toán
   * @param {number|string} amount - Số tiền (có thể là string từ Sequelize DECIMAL)
   * @returns {boolean}
   */
  validateAmount(amount) {
    // Convert string to number (Sequelize DECIMAL returns string)
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (!numAmount || typeof numAmount !== 'number' || isNaN(numAmount)) {
      return false;
    }
    if (numAmount <= 0) {
      return false;
    }
    if (numAmount > 1000000000) { // Max 1 tỷ VND
      return false;
    }
    return true;
  }

  /**
   * Format currency VND
   * @param {number} amount - Số tiền
   * @returns {string}
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
  }

  /**
   * Parse gateway response
   * @param {string|Object} response - Response từ gateway
   * @returns {Object}
   */
  parseGatewayResponse(response) {
    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch {
        return { raw: response };
      }
    }
    return response;
  }

  /**
   * Lấy client IP từ request
   * @param {Object} req - Express request
   * @returns {string}
   */
  getClientIp(req) {
    return (
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.ip ||
      '127.0.0.1'
    );
  }

  /**
   * Tạo Payment record trong database
   * @param {Object} params - Thông tin payment
   * @returns {Promise<Payment>}
   */
  async createPaymentRecord(params) {
    const { orderId, paymentMethod, gateway, amount, transactionId, status = 'pending' } = params;

    const payment = await Payment.create({
      order_id: orderId,
      payment_method: paymentMethod,
      payment_gateway: gateway,
      transaction_id: transactionId,
      amount,
      currency: 'VND',
      status,
    });

    return payment;
  }

  /**
   * Cập nhật trạng thái Payment
   * @param {number} paymentId - Payment ID
   * @param {Object} updates - Các field cần update
   * @returns {Promise<Payment>}
   */
  async updatePaymentStatus(paymentId, updates) {
    const payment = await Payment.findByPk(paymentId);
    
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    await payment.update(updates);
    return payment;
  }

  /**
   * Cập nhật trạng thái Order payment
   * @param {number} orderId - Order ID
   * @param {string} paymentStatus - Trạng thái thanh toán mới
   * @returns {Promise<Order>}
   */
  async updateOrderPaymentStatus(orderId, paymentStatus) {
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    await order.update({ payment_status: paymentStatus });
    return order;
  }

  /**
   * Kiểm tra payment có thể refund không
   * @param {Payment} payment - Payment record
   * @param {number} refundAmount - Số tiền muốn refund
   * @returns {Object}
   */
  validateRefund(payment, refundAmount) {
    if (payment.status !== 'completed') {
      return { valid: false, error: 'Only completed payments can be refunded' };
    }

    const refundableAmount = payment.getRefundableAmount();
    
    if (refundAmount > refundableAmount) {
      return { 
        valid: false, 
        error: `Refund amount exceeds refundable amount. Max: ${this.formatCurrency(refundableAmount)}` 
      };
    }

    if (refundAmount <= 0) {
      return { valid: false, error: 'Refund amount must be greater than 0' };
    }

    return { valid: true };
  }

  // ========== STATIC CONSTANTS ==========

  static STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  };

  static PAYMENT_METHODS = {
    COD: 'cash_on_delivery',
    VNPAY: 'bank_transfer',
    MOMO: 'digital_wallet',
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    PAYPAL: 'paypal',
    BANK_TRANSFER: 'bank_transfer',
    LOYALTY_POINTS: 'loyalty_points',
  };

  static GATEWAY = {
    COD: 'cod',
    VNPAY: 'vnpay',
    MOMO: 'momo',
    STRIPE: 'stripe',
    PAYPAL: 'paypal',
    ZALOPAY: 'zalopay',
    MANUAL: 'manual',
  };
}

module.exports = BasePaymentService;
