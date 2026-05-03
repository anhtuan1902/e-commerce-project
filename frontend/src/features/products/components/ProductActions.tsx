import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { memo } from 'react';

interface ProductActionsProps {
  quantity: number;
  stock: number;
  onQuantityChange: (delta: number) => void;
}

const ProductActions = memo(({ quantity, stock, onQuantityChange }: ProductActionsProps) => (
  <div className='flex items-center mb-8'>
    <span className='text-gray-500 text-sm w-24 shrink-0'>Số Lượng</span>
    <div className='flex items-center border border-gray-300 rounded-md'>
      <button
        onClick={() => onQuantityChange(-1)}
        disabled={quantity <= 1}
        className='px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <Minus className='h-4 w-4' />
      </button>
      <input
        type='text'
        value={quantity}
        readOnly
        className='w-12 text-center border-l border-r border-gray-300 py-1.5 text-sm font-medium focus:outline-none'
      />
      <button
        onClick={() => onQuantityChange(1)}
        disabled={quantity >= stock}
        className='px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <Plus className='h-4 w-4' />
      </button>
    </div>
    <span className='text-sm text-gray-500 ml-4'>{stock} sản phẩm có sẵn</span>
  </div>
));

interface ActionButtonsProps {
  stock: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export const ActionButtons = memo(({ stock, onAddToCart, onBuyNow }: ActionButtonsProps) => (
  <div className='flex gap-4 mt-auto'>
    <button
      onClick={onAddToCart}
      disabled={stock === 0}
      className='flex-1 bg-indigo-50 border border-[#1E3A8A] text-[#1E3A8A] py-3.5 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed'
    >
      <ShoppingCart className='h-5 w-5 mr-2' /> Thêm Vào Giỏ Hàng
    </button>
    <button
      onClick={onBuyNow}
      disabled={stock === 0}
      className='flex-1 bg-[#1E3A8A] text-white py-3.5 rounded-lg font-bold text-sm hover:bg-[#0f1e47] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
    >
      Mua Ngay
    </button>
  </div>
));

export default ProductActions;
