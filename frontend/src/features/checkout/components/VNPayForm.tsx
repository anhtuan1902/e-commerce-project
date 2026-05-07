import { memo, useState, useCallback } from 'react';
import { CreditCard, Lock, Building2 } from 'lucide-react';

interface VNPayFormProps {
  amount: number;
  onSubmit: (cardData: VNPayCardData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface VNPayCardData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export const VNPayForm = memo<VNPayFormProps>(({ amount, onSubmit, onCancel, isLoading = false }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof VNPayCardData, string>>>({});

  // Format card number with spaces
  const formatCardNumber = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }, []);

  // Format expiry date as MM/YY
  const formatExpiryDate = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  }, []);

  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
    setErrors((prev) => ({ ...prev, cardNumber: undefined }));
  }, [formatCardNumber]);

  const handleCardHolderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCardHolder(e.target.value.toUpperCase());
    setErrors((prev) => ({ ...prev, cardHolder: undefined }));
  }, []);

  const handleExpiryDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
    setErrors((prev) => ({ ...prev, expiryDate: undefined }));
  }, [formatExpiryDate]);

  const handleCvvChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(cleaned);
    setErrors((prev) => ({ ...prev, cvv: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof VNPayCardData, string>> = {};
    const cardNum = cardNumber.replace(/\s/g, '');

    if (!cardNum || cardNum.length < 13) {
      newErrors.cardNumber = 'Số thẻ không hợp lệ';
    }

    if (!cardHolder || cardHolder.length < 2) {
      newErrors.cardHolder = 'Tên chủ thẻ không hợp lệ';
    }

    const expiryParts = expiryDate.split('/');
    if (expiryParts.length !== 2) {
      newErrors.expiryDate = 'Định dạng không hợp lệ (MM/YY)';
    } else {
      const month = parseInt(expiryParts[0], 10);
      const year = parseInt(`20${expiryParts[1]}`, 10);
      const now = new Date();
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Tháng không hợp lệ';
      } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        newErrors.expiryDate = 'Thẻ đã hết hạn';
      }
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'CVV không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cardNumber, cardHolder, expiryDate, cvv]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolder,
        expiryDate,
        cvv,
      });
    }
  }, [cardNumber, cardHolder, expiryDate, cvv, validate, onSubmit]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Thanh toán qua VNPay</h3>
            <p className="text-white/80 text-sm">Nhập thông tin thẻ để thanh toán</p>
          </div>
        </div>
      </div>

      {/* Card Preview */}
      <div className="px-6 py-4 bg-slate-50">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-6 bg-yellow-400 rounded-sm" />
              <div className="w-10 h-6 bg-red-500 rounded-sm -ml-4 opacity-80" />
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">Số dư</p>
              <p className="font-mono text-lg">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
              </p>
            </div>
          </div>
          <p className="font-mono text-xl tracking-widest mb-4">
            {cardNumber || '•••• •••• •••• ••••'}
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-white/60">Chủ thẻ</p>
              <p className="font-medium text-sm uppercase tracking-wide">
                {cardHolder || 'TÊN CHỦ THẺ'}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60">Hết hạn</p>
              <p className="font-mono text-sm">{expiryDate || 'MM/YY'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Số thẻ
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
              autoComplete="cc-number"
            />
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          {errors.cardNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Card Holder */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Tên chủ thẻ
          </label>
          <input
            type="text"
            value={cardHolder}
            onChange={handleCardHolderChange}
            placeholder="NGUYEN VAN A"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
              errors.cardHolder ? 'border-red-500 bg-red-50' : 'border-slate-200'
            }`}
            autoComplete="cc-name"
          />
          {errors.cardHolder && (
            <p className="text-red-500 text-xs mt-1">{errors.cardHolder}</p>
          )}
        </div>

        {/* Expiry Date & CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Ngày hết hạn
            </label>
            <input
              type="text"
              value={expiryDate}
              onChange={handleExpiryDateChange}
              placeholder="MM/YY"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                errors.expiryDate ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
              autoComplete="cc-exp"
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              CVV
            </label>
            <div className="relative">
              <input
                type="password"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="•••"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                  errors.cvv ? 'border-red-500 bg-red-50' : 'border-slate-200'
                }`}
                autoComplete="cc-csc"
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {errors.cvv && (
              <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Thông tin thẻ của bạn được bảo mật bởi VNPay. Chúng tôi không lưu trữ thông tin thẻ của bạn.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Thanh toán
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
});

VNPayForm.displayName = 'VNPayForm';

export default VNPayForm;
