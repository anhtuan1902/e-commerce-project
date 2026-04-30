import type { CartItem } from '@/store/cart.store';
import {
  calculateCheckoutTotalPrice,
  calculateDiscountPrice,
  convertCurrency,
} from '@/shared/utils/convertCurrency';
import { ChevronLeft } from 'lucide-react';
import { memo } from 'react';

interface OrderSummaryProps {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  discount: number;
  onBack: () => void;
  onConfirmOrder?: () => void;
}

export const OrderSummary = memo<OrderSummaryProps>(
  ({ items, totalPrice, discount, onBack, onConfirmOrder }) => {
    const discountAmount = calculateDiscountPrice(totalPrice, discount);
    const finalPrice = calculateCheckoutTotalPrice(totalPrice, 0, discount);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
        <h3 className="font-bold text-slate-800 mb-4">Chi tiết đơn hàng</h3>
        <div className="max-h-48 overflow-y-auto space-y-3 mb-6 pr-2 scrollbar-thin">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 text-sm mt-2">
              <div className="relative shrink-0">
                <img
                  src={item.imageUrl || '/placeholder.png'}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                  loading="lazy"
                />
                <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{item.name}</p>
                <p className="text-slate-400 text-xs">{convertCurrency(item.price)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-50 mb-6">
          <div className="flex justify-between text-slate-500 text-sm">
            <span>Tạm tính</span>
            <span>{convertCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-slate-500 text-sm">
            <span>Phí vận chuyển</span>
            <span>{convertCurrency(0)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600 text-sm font-medium">
              <span>Khuyến mãi</span>
              <span>-{convertCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-end pt-2">
            <span className="font-bold text-slate-900">Tổng thanh toán</span>
            <span className="text-2xl font-black text-indigo-600">{convertCurrency(finalPrice)}</span>
          </div>
        </div>

        <button
          onClick={onConfirmOrder}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          XÁC NHẬN ĐẶT HÀNG
        </button>

        <button
          onClick={onBack}
          className="w-full mt-3 py-3 text-slate-500 font-bold text-sm hover:text-slate-700 flex items-center justify-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại giỏ hàng
        </button>
      </div>
    );
  },
);

OrderSummary.displayName = 'OrderSummary';
