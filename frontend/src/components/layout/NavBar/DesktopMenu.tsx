import { ShoppingCart } from 'lucide-react';

interface NavItem {
  label: string;
  onClick?: () => void;
}

interface DesktopMenuProps {
  marketplace?: NavItem;
  vendor?: NavItem;
  cartCount?: number;
  onCartClick?: () => void;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

const DesktopMenu = ({
  marketplace,
  vendor,
  cartCount = 2,
  onCartClick,
  onLoginClick,
  onSignUpClick,
}: DesktopMenuProps) => {
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      console.log('Navigate to login');
    }
  };
  return (
    <div className='hidden md:flex items-center space-x-4 lg:space-x-6'>
      <button
        onClick={marketplace?.onClick || (() => console.log('Navigate to marketplace'))}
        className='text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors'
      >
        {marketplace?.label || 'Chợ điện tử'}
      </button>
      <button
        onClick={vendor?.onClick || (() => console.log('Navigate to vendor panel'))}
        className='text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors'
      >
        {vendor?.label || 'Kênh Người Bán'}
      </button>
      <div
        className='relative cursor-pointer'
        onClick={onCartClick || (() => console.log('Navigate to checkout'))}
      >
        <ShoppingCart className='h-5 lg:h-6 w-5 lg:w-6 text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors' />
        <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
          {cartCount}
        </span>
      </div>
      <div className='flex items-center space-x-2 lg:space-x-3 border-l pl-4 lg:pl-6 border-gray-200 dark:border-gray-700'>
        <button
          onClick={handleLoginClick}
          className='text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors'
        >
          Đăng nhập
        </button>
        <button
          onClick={onSignUpClick || (() => console.log('Navigate to register'))}
          className='text-xs lg:text-sm font-medium bg-[#1E3A8A] dark:bg-indigo-500 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-[#1E3A8A] transition-colors'
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
};

export default DesktopMenu;
