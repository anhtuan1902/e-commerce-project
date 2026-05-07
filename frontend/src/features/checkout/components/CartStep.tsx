import { convertCurrency } from '@/shared/utils/convertCurrency';
import type { CartItem } from '@/store/cart.store';
import { ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { memo } from 'react';
import { CartItemRow } from './CartItemRow';
import { EmptyCart } from './EmptyCart';

interface CartStepProps {
  cartItems: CartItem[];
  totalItems: number;
  subtotal: number;
  totalPrice: number;
  shippingFee: number;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

const CartSummary = memo<Pick<CartStepProps, 'subtotal' | 'totalItems' | 'totalPrice' | 'onCheckout' | 'shippingFee'>>(
  function CartSummary({ totalItems, totalPrice, onCheckout, shippingFee, subtotal }) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Ticket className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800">Mã khuyến mãi</h3>
          </div>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Nhập mã ưu đãi..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <button
              disabled={totalItems === 0}
              className="px-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Áp dụng
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Tạm tính ({totalItems} sản phẩm)</span>
              <span>{convertCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Phí vận chuyển</span>
              <span className="text-green-600 font-medium italic">{convertCurrency(shippingFee)}</span>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
              <span className="font-bold text-slate-900">Tổng cộng</span>
              <div className="text-right">
                <p className="text-2xl font-black text-indigo-600">{convertCurrency(totalPrice)}</p>
                <p className="text-[10px] text-slate-400 italic">(Đã bao gồm VAT nếu có)</p>
              </div>
            </div>
          </div>

          <button
            disabled={totalItems === 0}
            onClick={onCheckout}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none cursor-pointer"
          >
            THANH TOÁN NGAY
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 text-slate-400">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Bảo mật thông tin 100%</span>
        </div>
      </div>
    );
  },
);

CartSummary.displayName = 'CartSummary';

export const CartStep = memo<CartStepProps>(function CartStep({
  cartItems,
  subtotal,
  totalItems,
  totalPrice,
  shippingFee,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Sản phẩm ({cartItems.length})</h2>
            <button
              onClick={onClearCart}
              disabled={totalItems === 0}
              className="text-xs text-red-500 font-bold hover:underline"
            >
              Xoá tất cả
            </button>
          </div>
          {cartItems.length > 0 ? (
            <div className="divide-y divide-slate-50 h-[25em] overflow-y-auto">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveItem}
                />
              ))}
            </div>
          ) : (
            <EmptyCart />
          )}
        </div>
      </div>

      <CartSummary totalItems={totalItems} totalPrice={totalPrice} onCheckout={onCheckout} shippingFee={shippingFee} subtotal={subtotal} />
    </div>
  );
});
