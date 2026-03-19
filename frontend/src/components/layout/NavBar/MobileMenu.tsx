interface NavItem {
  label: string;
  onClick?: () => void;
}

interface MobileMenuProps {
  isOpen: boolean;
  marketplace?: NavItem;
  vendor?: NavItem;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
  onMenuItemClick?: () => void;
}

const MobileMenu = ({
  isOpen,
  marketplace,
  vendor,
  onLoginClick,
  onSignUpClick,
  onMenuItemClick,
}: MobileMenuProps) => {
  if (!isOpen) return null;

  const handleMenuItemClick = (callback?: () => void) => {
    callback?.();
    onMenuItemClick?.();
  };

  return (
    <div className='md:hidden border-t border-gray-200 pb-3 pt-2'>
      {/* Mobile Navigation Items */}
      <button
        onClick={() =>
          handleMenuItemClick(
            marketplace?.onClick || (() => console.log('Navigate to marketplace')),
          )
        }
        className='block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-md transition-colors'
      >
        {marketplace?.label || 'Chợ điện tử'}
      </button>
      <button
        onClick={() =>
          handleMenuItemClick(vendor?.onClick || (() => console.log('Navigate to vendor panel')))
        }
        className='block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-md transition-colors'
      >
        {vendor?.label || 'Kênh Người Bán'}
      </button>

      {/* Mobile Auth Buttons */}
      <div className='flex flex-col space-y-2 px-3 pt-3 border-t border-gray-200 mt-3'>
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
    </div>
  );
};

export default MobileMenu;
