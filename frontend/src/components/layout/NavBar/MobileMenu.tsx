import { useAppDispatch, useAppSelector } from '@/hooks';
import useCheckRole from '@/hooks/useCheckRole';
import { logoutThunk } from '@/store/slices/authSlice';
import { ShoppingCart, User } from 'lucide-react';
import { is } from 'zod/v4/locales';

interface MobileMenuProps {
  isOpen: boolean;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

const MobileMenu = ({ isOpen, onLoginClick, onSignUpClick }: MobileMenuProps) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const isVendor = useCheckRole({ role: 'vendor' });
  if (!isOpen) return null;

  const handleMenuItemClick = (callback?: () => void) => {
    callback?.();
  };

  const ItemUser = [
    {
      key: 'profile',
      label: 'Tài khoản của tôi',
      icon: <User className='mr-2' size={16} />,
      onClick: () => console.log('Navigate to profile'),
    },
    {
      key: 'orders',
      label: 'Đơn hàng',
      icon: <ShoppingCart className='mr-2' size={16} />,
      onClick: () => console.log('Navigate to orders'),
    },
  ];

  return (
    <div className='md:hidden border-t border-gray-200 pb-3 pt-2'>
      {/* Mobile Navigation Items */}
      {isAuthenticated &&
        ItemUser.map((item) => (
          <button
            key={item.key}
            onClick={() => handleMenuItemClick(item.onClick)}
            className='flex w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-md transition-colors'
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      {isVendor && (
        <>
          <button
            onClick={() => handleMenuItemClick(() => console.log('Navigate to marketplace'))}
            className='block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-md transition-colors'
          >
            {'Chợ điện tử'}
          </button>
          <button
            onClick={() => handleMenuItemClick(() => console.log('Navigate to vendor panel'))}
            className='block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-md transition-colors'
          >
            {'Kênh Người Bán'}
          </button>
        </>
      )}

      {/* Mobile Auth Buttons */}
      {isAuthenticated ? (
        <div className='flex flex-col space-y-2 px-3 pt-3 border-t border-gray-200 mt-3'>
          <button
            onClick={() => dispatch(logoutThunk()).unwrap()}
            className='w-full text-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-md transition-colors'
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        <div className='flex flex-col space-y-2 px-3'>
          <button
            onClick={() => handleMenuItemClick(onLoginClick)}
            className='w-full text-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-md transition-colors'
          >
            Đăng nhập
          </button>
          <button
            onClick={() => handleMenuItemClick(onSignUpClick)}
            className='w-full text-center px-3 py-2 text-sm font-medium bg-[#1E3A8A] text-white rounded-lg hover:bg-indigo-700 transition-colors'
          >
            Đăng ký
          </button>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
