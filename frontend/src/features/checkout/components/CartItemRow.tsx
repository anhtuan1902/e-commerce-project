import { convertCurrency } from '@/shared/utils/convertCurrency';
import type { CartItem } from '@/store/cart.store';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
}

export const CartItemRow = memo<CartItemRowProps>(function CartItemRow({
  item,
  onUpdateQuantity,
  onRemoveItem,
}) {
  const [inputValue, setInputValue] = useState(String(item.quantity));

  useEffect(() => setInputValue(String(item.quantity)), [item.quantity]);

  const updateQuantity = useCallback(
    (newQuantity: number) => {
      const delta = newQuantity - item.quantity;
      if (delta !== 0) onUpdateQuantity(item.id, delta);
    },
    [item.id, item.quantity, onUpdateQuantity],
  );

  const handleDecrement = useCallback(() => {
    if (item.quantity > 1) updateQuantity(item.quantity - 1);
  }, [item.quantity, updateQuantity]);

  const handleIncrement = useCallback(() => updateQuantity(item.quantity + 1), [item.quantity, updateQuantity]);

  const handleInputBlur = useCallback(() => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value >= 1 && value !== item.quantity) {
      updateQuantity(value);
    } else {
      setInputValue(String(item.quantity));
    }
  }, [inputValue, item.quantity, updateQuantity]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.replace(/\D/g, ''));
  }, []);

  const handleRemove = useCallback(() => onRemoveItem(item.id), [item.id, onRemoveItem]);

  return (
    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-20 h-20 rounded-xl object-cover bg-slate-100"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-indigo-600 font-bold mb-1 uppercase tracking-wide">{item.shop}</p>
        <h3 className="font-semibold text-slate-900 truncate mb-2">{item.name}</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-black text-lg text-slate-900">{convertCurrency(item.price)}</span>
          {item.compare_price && (
            <span className="text-slate-400 line-through text-xs">{convertCurrency(item.compare_price)}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg p-1">
        <button
          onClick={handleDecrement}
          className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors shadow-sm"
          aria-label="Giảm số lượng"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-12 h-8 text-center font-bold text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          onClick={handleIncrement}
          className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-colors shadow-sm"
          aria-label="Tăng số lượng"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <button onClick={handleRemove} className="text-slate-300 hover:text-red-500 transition-colors p-2" aria-label="Xóa sản phẩm">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
});
