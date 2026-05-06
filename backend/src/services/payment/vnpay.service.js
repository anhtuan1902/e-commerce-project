const crypto = require('crypto');
const qs = require('qs');
const moment = require('moment');

function createPaymentUrl({ amount, orderId, orderInfo, clientIp }) {
  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_Amount: amount * 100,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: process.env.APP_URL,
    vnp_IpAddr: clientIp,
    vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
  };

  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, k) => {
      acc[k] = params[k];
      return acc;
    }, {});

  const signData = qs.stringify(sorted, { encode: true });

  const hmac = crypto.createHmac('sha512', process.env.VNP_HASH_SECRET);
  sorted.vnp_SecureHash = hmac.update(signData).digest('hex');
  sorted.vnp_SecureHashType = 'SHA512';

  return `${process.env.VNP_URL}?${qs.stringify(sorted, { encode: false })}`;
}
