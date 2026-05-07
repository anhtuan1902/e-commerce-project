const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');
const BasePaymentService = require('./base.payment.service');

/**
 * VNPay Payment Service
 * Tích hợp thanh toán qua cổng VNPay
 */
class VNPayService extends BasePaymentService {
  constructor() {
    super();
    this.gatewayName = 'VNPay';
    
    // VNPay config
    this.vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.tmnCode = process.env.VNP_TMN_CODE;
    this.hashSecret = process.env.VNP_HASH_SECRET;
    this.returnUrl = process.env.VNP_RETURN_URL;
  }

  /**
   * Tạo URL thanh toán VNPay
   * @param {Object} params
   * @param {Object} params.order - Order object
   * @param {Object} params.user - User object
   * @param {Object} params.req - Express request (để lấy IP)
   * @returns {Promise<{success: boolean, paymentUrl: string, transactionId: string}>}
   */
  async createPayment(params) {
    const { order, user, req } = params;

    // Debug log amount type
    console.log(`[VNPay] Order total_amount: ${order.total_amount}, type: ${typeof order.total_amount}`);

    // Validate amount
    if (!this.validateAmount(order.total_amount)) {
      console.error(`[VNPay] Invalid payment amount: ${order.total_amount}, type: ${typeof order.total_amount}`);
      throw new Error('Invalid payment amount');
    }

    // Generate transaction ID
    const transactionId = this.generateTransactionId('VNP');

    // Create payment record
    const payment = await this.createPaymentRecord({
      orderId: order.id,
      paymentMethod: 'bank_transfer',
      gateway: 'vnpay',
      amount: order.total_amount,
      transactionId,
      status: 'pending',
    });

    // Tạo payment URL
    const paymentUrl = this._createPaymentUrl({
      amount: order.total_amount,
      orderId: order.id,
      transactionId,
      orderInfo: this.generateOrderInfo(order),
      clientIp: this.getClientIp(req),
    });

    console.log(`[VNPay] Payment created for order ${order.order_number}, URL: ${paymentUrl}`);

    return {
      success: true,
      payment,
      paymentUrl,
      transactionId,
    };
  }

  /**
   * Tạo payment URL với signature VNPay
   * @private
   */
  _createPaymentUrl({ amount, orderId, transactionId, orderInfo, clientIp }) {
    const params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: amount * 100, // VNPay yêu cầu * 100
      vnp_CurrCode: 'VND',
      vnp_TxnRef: transactionId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: clientIp,
      vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
    };

    // Sort params alphabetically
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, k) => {
        acc[k] = params[k];
        return acc;
      }, {});

    // Create signature
    const signData = qs.stringify(sorted, { encode: true });
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    sorted.vnp_SecureHash = hmac.update(signData).digest('hex');

    // Build URL
    return `${this.vnpUrl}?${qs.stringify(sorted, { encode: false })}`;
  }

  /**
   * Xác thực callback từ VNPay
   * @param {Object} callbackData - Data từ VNPay IPN/Return
   * @returns {boolean}
   */
  verifyCallback(callbackData) {
    const {
      vnp_SecureHash,
      vnp_SecureHashType,
      ...params
    } = callbackData;

    // Remove secure hash from params
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    // Sort and create signature
    const sorted = Object.keys(params)
      .sort()
      .reduce((acc, k) => {
        acc[k] = params[k];
        return acc;
      }, {});

    const signData = qs.stringify(sorted, { encode: true });
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const calculatedHash = hmac.update(signData).digest('hex');

    // Compare hashes (case-insensitive)
    return calculatedHash.toLowerCase() === vnp_SecureHash?.toLowerCase();
  }

  /**
   * Xử lý callback thành công từ VNPay
   * @param {Object} callbackData
   * @returns {Promise<Object>}
   */
  async handleSuccess(callbackData) {
    const {
      vnp_TxnRef,        // Transaction ID
      vnp_Amount,        // Amount (đã * 100)
      vnp_ResponseCode,  // Response code
      vnp_BankCode,      // Bank code
      vnp_BankTranNo,    // Bank transaction number
      vnp_PayDate,       // Payment date
      vnp_TransactionNo, // VNPay transaction number
    } = callbackData;

    // Check response code (00 = success)
    if (vnp_ResponseCode !== '00') {
      return await this.handleFailure({
        ...callbackData,
        failureReason: this._getResponseMessage(vnp_ResponseCode),
      });
    }

    return await super.handleSuccess({
      orderId: callbackData.orderId || vnp_TxnRef,
      transactionId: vnp_TransactionNo || vnp_TxnRef,
      amount: vnp_Amount / 100,
      gatewayResponse: {
        vnp_BankCode,
        vnp_BankTranNo,
        vnp_PayDate,
        vnp_TransactionNo,
        vnp_ResponseCode,
      },
    });
  }

  /**
   * Lấy message từ VNPay response code
   * @private
   */
  _getResponseMessage(code) {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, các trường hợp smart contract mannipulate...)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ Internet Banking',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạt chờ thanh toán',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do: Khách hàng nhập sai mật khẩu xác thực thanh toán',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư',
      '65': 'Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác',
    };
    return messages[code] || `Lỗi không xác định (code: ${code})`;
  }

  /**
   * Yêu cầu hoàn tiền VNPay
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

    // Tạo refund request
    const refundTransactionId = this.generateTransactionId('REF');

    // Trong thực tế, bạn sẽ gọi API refund của VNPay ở đây
    // const refundUrl = this._createRefundUrl({ payment, amount, refundTransactionId, reason });

    console.log(`[VNPay] Refund requested: ${this.formatCurrency(amount)} for payment ${payment.id}`);

    // Cập nhật payment
    const updatedPayment = await payment.processRefund(amount, reason);

    return {
      success: true,
      payment: updatedPayment,
      refundTransactionId,
      message: `Yêu cầu hoàn tiền đã được tạo. Mã giao dịch hoàn: ${refundTransactionId}`,
    };
  }

  /**
   * Xác thực callback hoàn tiền từ VNPay
   * @param {Object} callbackData
   * @returns {boolean}
   */
  verifyRefundCallback(callbackData) {
    return this.verifyCallback(callbackData);
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPay
   * IPN là callback server-to-server, không có redirect
   * @param {Object} callbackData
   * @returns {Promise<Object>}
   */
  async handleIPN(callbackData) {
    // Verify signature
    if (!this.verifyCallback(callbackData)) {
      console.error('[VNPay] IPN: Invalid signature');
      return {
        success: false,
        RspCode: '97',
        Message: 'Invalid signature',
      };
    }

    const { vnp_ResponseCode, vnp_TxnRef, vnp_Amount } = callbackData;

    try {
      // Find payment by transaction ID
      const payment = await this.getPaymentByTransactionId(vnp_TxnRef);

      if (!payment) {
        return {
          success: false,
          RspCode: '01',
          Message: 'Order not found',
        };
      }

      if (vnp_ResponseCode === '00') {
        // Success
        await this.handleSuccess({
          ...callbackData,
          orderId: payment.order_id,
        });

        return {
          success: true,
          RspCode: '00',
          Message: 'Confirm Success',
        };
      } else {
        // Failed
        await this.handleFailure({
          ...callbackData,
          orderId: payment.order_id,
          failureReason: this._getResponseMessage(vnp_ResponseCode),
        });

        return {
          success: false,
          RspCode: vnp_ResponseCode,
          Message: this._getResponseMessage(vnp_ResponseCode),
        };
      }
    } catch (error) {
      console.error('[VNPay] IPN Error:', error);
      return {
        success: false,
        RspCode: '99',
        Message: 'System error',
      };
    }
  }

  /**
   * Tìm payment theo transaction ID
   * @param {string} transactionId
   * @returns {Promise<Payment|null>}
   */
  async getPaymentByTransactionId(transactionId) {
    const Payment = require('../../models/Payment');
    return await Payment.findOne({
      where: { transaction_id: transactionId },
    });
  }
}

module.exports = new VNPayService();
