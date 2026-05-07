const crypto = require('crypto');
const axios = require('axios');
const BasePaymentService = require('./base.payment.service');

/**
 * MoMo Payment Service
 * Tích hợp thanh toán qua ví MoMo
 */
class MoMoService extends BasePaymentService {
  constructor() {
    super();
    this.gatewayName = 'MoMo';
    
    // MoMo config
    this.endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
    this.partnerCode = process.env.MOMO_PARTNER_CODE;
    this.accessKey = process.env.MOMO_ACCESS_KEY;
    this.secretKey = process.env.MOMO_SECRET_KEY;
    this.returnUrl = process.env.MOMO_RETURN_URL;
    this.notifyUrl = process.env.MOMO_NOTIFY_URL;
  }

  /**
   * Tạo thanh toán MoMo
   * @param {Object} params
   * @param {Object} params.order - Order object
   * @param {Object} params.user - User object
   * @param {Object} params.req - Express request
   * @returns {Promise<{success: boolean, paymentUrl?: string, qrCode?: string, deeplink?: string, transactionId: string}>}
   */
  async createPayment(params) {
    const { order, user } = params;

    // Validate amount
    if (!this.validateAmount(order.total_amount)) {
      throw new Error('Invalid payment amount');
    }

    // Generate transaction ID
    const transactionId = this.generateTransactionId('MOMO');

    // Create payment record
    const payment = await this.createPaymentRecord({
      orderId: order.id,
      paymentMethod: 'digital_wallet',
      gateway: 'momo',
      amount: order.total_amount,
      transactionId,
      status: 'pending',
    });

    // Tạo request body cho MoMo
    const requestId = transactionId;
    const orderId = transactionId;
    const orderInfo = this.generateOrderInfo(order);
    const amount = Math.round(order.total_amount); // MoMo yêu cầu integer

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      returnUrl: this.returnUrl,
      notifyUrl: this.notifyUrl,
      extraData: JSON.stringify({ orderId: order.id, userId: user?.id }),
      requestType: 'payWithMoMoATM', // Hoặc 'captureMoMoWallet' cho app
    };

    // Tạo signature
    const signature = this._createSignature(requestBody);
    requestBody.signature = signature;

    try {
      // Gọi API MoMo
      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { payUrl, deeplink, qrCodeUrl, errorCode } = response.data;

      if (errorCode !== 0) {
        throw new Error(`MoMo error: ${errorCode} - ${response.data.localMessage}`);
      }

      console.log(`[MoMo] Payment created for order ${order.order_number}`);

      return {
        success: true,
        payment,
        paymentUrl: payUrl, // URL để redirect user
        deeplink,           // Deep link cho app MoMo
        qrCode: qrCodeUrl,   // QR Code URL
        transactionId,
        message: 'Vui lòng thanh toán qua MoMo',
      };
    } catch (error) {
      console.error('[MoMo] Error creating payment:', error);
      
      // Update payment status to failed
      await payment.update({ status: 'failed', failure_reason: error.message });
      
      throw error;
    }
  }

  /**
   * Tạo signature cho MoMo request
   * @private
   */
  _createSignature(data) {
    // Sort keys alphabetically
    const sorted = Object.keys(data)
      .sort()
      .reduce((acc, key) => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          acc[key] = data[key];
        }
        return acc;
      }, {});

    // Create query string
    const rawSignature = Object.keys(sorted)
      .map(key => `${key}=${sorted[key]}`)
      .join('&');

    // Hash with HMAC SHA256
    const hmac = crypto.createHmac('sha256', this.secretKey);
    return hmac.update(rawSignature).digest('hex');
  }

  /**
   * Xác thực callback từ MoMo
   * @param {Object} callbackData - Data từ MoMo callback
   * @returns {boolean}
   */
  verifyCallback(callbackData) {
    const { signature, ...params } = callbackData;

    // Remove signature from params for verification
    const filteredParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    // Recreate signature
    const rawSignature = Object.keys(filteredParams)
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&');

    const hmac = crypto.createHmac('sha256', this.secretKey);
    const calculatedSignature = hmac.update(rawSignature).digest('hex');

    // Compare signatures
    return calculatedSignature === signature;
  }

  /**
   * Xử lý callback thành công từ MoMo
   * @param {Object} callbackData
   * @returns {Promise<Object>}
   */
  async handleSuccess(callbackData) {
    const {
      orderId,           // MoMo transaction ID
      amount,           // Amount paid
      transId,          // MoMo trans ID
      resultCode,       // 0 = success
      message,
      payType,
      partnerUserId,
    } = callbackData;

    // Check result code (0 = success)
    if (resultCode !== 0) {
      return await this.handleFailure({
        ...callbackData,
        failureReason: message || `MoMo error code: ${resultCode}`,
      });
    }

    // Parse extraData
    let extraData = {};
    if (callbackData.extraData) {
      try {
        extraData = JSON.parse(callbackData.extraData);
      } catch {
        // ignore parse error
      }
    }

    return await super.handleSuccess({
      orderId: extraData.orderId || callbackData.orderId,
      transactionId: transId || orderId,
      amount: parseFloat(amount),
      gatewayResponse: {
        transId,
        resultCode,
        message,
        payType,
        partnerUserId,
      },
    });
  }

  /**
   * Yêu cầu hoàn tiền MoMo
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

    const refundTransactionId = this.generateTransactionId('MREF');
    const requestId = refundTransactionId;

    const refundBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount: Math.round(amount).toString(),
      orderId: payment.transaction_id, // Original MoMo transaction ID
      transId: payment.transaction_id,
      lang: 'vi',
      description: reason || 'Refund request',
    };

    // Create signature
    const signature = this._createSignature(refundBody);
    refundBody.signature = signature;

    try {
      const refundEndpoint = process.env.MOMO_REFUND_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/refund';
      
      const response = await axios.post(refundEndpoint, refundBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { resultCode, refundTransId, message } = response.data;

      if (resultCode === 0) {
        // Update payment
        const updatedPayment = await payment.processRefund(amount, reason);

        console.log(`[MoMo] Refund success: ${refundTransId}`);

        return {
          success: true,
          payment: updatedPayment,
          refundTransactionId: refundTransId,
          message: 'Hoàn tiền thành công',
        };
      } else {
        throw new Error(`MoMo refund error: ${resultCode} - ${message}`);
      }
    } catch (error) {
      console.error('[MoMo] Refund error:', error);
      throw error;
    }
  }

  /**
   * Xác thực callback hoàn tiền từ MoMo
   * @param {Object} callbackData
   * @returns {boolean}
   */
  verifyRefundCallback(callbackData) {
    return this.verifyCallback(callbackData);
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ MoMo
   * @param {Object} callbackData
   * @returns {Promise<Object>}
   */
  async handleIPN(callbackData) {
    // Verify signature
    if (!this.verifyCallback(callbackData)) {
      console.error('[MoMo] IPN: Invalid signature');
      return {
        status: 'error',
        message: 'Invalid signature',
      };
    }

    const { resultCode, orderId } = callbackData;

    try {
      // Parse extraData
      let extraData = {};
      if (callbackData.extraData) {
        try {
          extraData = JSON.parse(callbackData.extraData);
        } catch {
          // ignore
        }
      }

      // Find payment
      const payment = await this.getPaymentByTransactionId(orderId);

      if (!payment) {
        return {
          status: 'error',
          message: 'Payment not found',
        };
      }

      if (resultCode === 0) {
        await this.handleSuccess({
          ...callbackData,
          orderId: extraData.orderId || payment.order_id,
        });

        return {
          status: 'success',
          message: 'Payment confirmed',
        };
      } else {
        await this.handleFailure({
          ...callbackData,
          orderId: extraData.orderId || payment.order_id,
          failureReason: callbackData.message || `MoMo error: ${resultCode}`,
        });

        return {
          status: 'success',
          message: 'Payment failure recorded',
        };
      }
    } catch (error) {
      console.error('[MoMo] IPN Error:', error);
      return {
        status: 'error',
        message: 'System error',
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

module.exports = new MoMoService();
