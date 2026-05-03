import { memo, useCallback } from 'react';
import { CheckCircle2, Home, Truck } from 'lucide-react';
import { STEP_STORAGE_KEY } from '@/pages/CartCheckoutPage';

interface SuccessStepProps {
  orderCode: string;
  onContinueShopping: () => void;
}

export const SuccessStep = memo(function SuccessStep({
  orderCode,
  onContinueShopping,
}: SuccessStepProps) {
  const handleContinueShopping = useCallback(() => {
    onContinueShopping();
    sessionStorage.removeItem(STEP_STORAGE_KEY);
  }, [onContinueShopping]);

  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="relative inline-block mb-8">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
        <div className="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
      </div>

      <h1 className="text-3xl font-black text-slate-900 mb-4">
        Đặt hàng thành công!
      </h1>
      <p className="text-slate-500 mb-2 font-medium">
        Mã đơn hàng của bạn là:{' '}
        <span className="text-indigo-600 font-black">{orderCode}</span>
      </p>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        Cảm ơn bạn đã tin tưởng mua sắm. Chúng tôi sẽ sớm liên hệ
        để xác nhận đơn hàng qua số điện thoại của bạn.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto">
        <button
          onClick={handleContinueShopping}
          className="bg-indigo-600 text-white px-3 w-fit rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
        >
          <Home className="w-5 h-5" /> Tiếp tục mua sắm
        </button>
        <button className="bg-white text-slate-700 border w-fit border-slate-200 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition-all">
          Theo dõi đơn hàng
        </button>
      </div>

      <div className="mt-12 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-left flex gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <Truck className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="font-bold text-indigo-900 text-sm">Thời gian giao hàng dự kiến</p>
          <p className="text-indigo-700/70 text-xs mt-1">
            Từ thứ 2 (04/05) đến thứ 4 (06/05). Miễn phí giao hàng cho đơn hàng
            đầu tiên của bạn!
          </p>
        </div>
      </div>
    </div>
  );
});
