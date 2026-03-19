import { Search, ShoppingCart, Menu, X } from 'lucide-react';

interface MobileTopBarProps {
  isSearchOpen: boolean;
  isMenuOpen: boolean;
  cartCount?: number;
  onSearchToggle: () => void;
  onMenuToggle: () => void;
  onCartClick?: () => void;
}

const MobileTopBar = ({
  isSearchOpen,
  isMenuOpen,
  cartCount = 2,
  onSearchToggle,
  onMenuToggle,
  onCartClick,
}: MobileTopBarProps) => {
  return (
    <div className='flex md:hidden items-center space-x-3'>
      {/* Mobile Search Icon - Hidden when search bar is open */}
      <button
        onClick={onSearchToggle}
        className='p-1 sm:hidden rounded-md text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors'
        aria-label='Toggle search'
      >
        <Search className='h-5 w-5' />
      </button>

      {/* Mobile Cart */}
      <div
        className='relative cursor-pointer'
        onClick={onCartClick || (() => console.log('Navigate to checkout'))}
      >
        <ShoppingCart className='h-5 w-5 text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors' />
        <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs'>
          {cartCount}
        </span>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuToggle}
        className='p-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors'
        aria-label='Toggle menu'
      >
        {isMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
      </button>
    </div>
  );
};

export default MobileTopBar;
