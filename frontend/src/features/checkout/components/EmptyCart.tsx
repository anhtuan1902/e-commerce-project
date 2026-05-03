import { useNavigate } from 'react-router-dom';
import { memo, useCallback } from 'react';
import { ROUTES } from '@/shared/constants/routes.constants';
import { ShoppingBag } from 'lucide-react';

export const EmptyCart = memo(function EmptyCart() {
  const navigate = useNavigate();

  const handleNavigate = useCallback(() => navigate(ROUTES.HOME), [navigate]);

  return (
    <div className="p-20 text-center">
      <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag className="text-slate-400 w-8 h-8" />
      </div>
      <p className="text-slate-500 font-medium">Giỏ hàng đang trống</p>
      <button onClick={handleNavigate} className="mt-4 text-indigo-600 font-bold cursor-pointer">
        Tiếp tục mua sắm
      </button>
    </div>
  );
});
