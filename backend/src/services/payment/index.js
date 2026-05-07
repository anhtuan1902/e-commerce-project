const BasePaymentService = require('./base.payment.service');
const VNPayService = require('./vnpay.service');
const MoMoService = require('./momo.service');
const CODService = require('./cod.service');

// Services are already singleton instances
const paymentServices = {
  cod: CODService,
  vnpay: VNPayService,
  momo: MoMoService,
};

/**
 * Factory function - Lấy payment service theo method
 * @param {string} method - Payment method (cod, vnpay, momo)
 * @returns {BasePaymentService} - Instance của payment service tương ứng
 */
function getPaymentService(method) {
  const service = paymentServices[method?.toLowerCase()];
  
  if (!service) {
    console.warn(`Payment service for method "${method}" not found, defaulting to COD`);
    return CODService;
  }
  
  return service;
}

/**
 * Lấy danh sách các payment methods được hỗ trợ
 * @returns {string[]}
 */
function getSupportedPaymentMethods() {
  return Object.keys(paymentServices);
}

module.exports = {
  BasePaymentService,
  VNPayService,
  MoMoService,
  CODService,
  getPaymentService,
  getSupportedPaymentMethods,
};
