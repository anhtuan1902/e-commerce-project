import { useAppDispatch, useAppSelector } from '@/hooks';
import useCheckRole from '@/hooks/useCheckRole';
import { logoutThunk } from '@/store/slices/authSlice';
import { Avatar, Dropdown, Space } from 'antd';
import { LogOut, ShoppingCart, User, User2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DesktopMenuProps {
  onCartClick?: () => void;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

const DesktopMenu = ({ onCartClick, onLoginClick, onSignUpClick }: DesktopMenuProps) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const isVendor = useCheckRole({ role: 'vendor' });

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      console.log('Navigate to login');
    }
  };

  const ItemUser = [
    {
      key: 'profile',
      label: 'Tài khoản của tôi',
      icon: <User className='mr-2' size={16} />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      label: 'Đơn hàng',
      icon: <ShoppingCart className='mr-2' size={16} />,
      onClick: () => console.log('Navigate to orders'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut className='mr-2' size={16} />,
      onClick: () => {
        dispatch(logoutThunk()).unwrap();
      },
    },
  ];

  return (
    <div className='hidden md:flex items-center space-x-4 lg:space-x-6'>
      {isVendor && (
        <>
          <button
            onClick={() => console.log('Navigate to marketplace')}
            className='text-xs lg:text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors'
          >
            Chợ điện tử
          </button>
          <button
            onClick={() => console.log('Navigate to vendor panel')}
            className='text-xs lg:text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors'
          >
            Kênh Người Bán
          </button>
        </>
      )}

      <div
        className='relative cursor-pointer'
        onClick={onCartClick || (() => console.log('Navigate to checkout'))}
      >
        <ShoppingCart className='h-5 lg:h-6 w-5 lg:w-6 text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors' />
        <span className='absolute -top-2 cursor-pointer -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
          2
        </span>
      </div>
      <div className='w-px h-8 bg-gray-200'></div>
      {isAuthenticated ? (
        <>
          <Dropdown
            menu={{
              items: ItemUser as [],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                {user?.profile?.avatarUrl ? (
                  <Avatar
                    src={
                      <img
                        src={user?.profile?.avatarUrl}
                        referrerPolicy='no-referrer'
                        alt={user?.profile?.name}
                      />
                    }
                  />
                ) : (
                  <Avatar icon={<User2 />} />
                )}

                <span className='hidden lg:inline-block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {user?.profile?.name}
                </span>
              </Space>
            </a>
          </Dropdown>
        </>
      ) : (
        <div className='flex items-center space-x-2 lg:space-x-3'>
          <button
            onClick={handleLoginClick}
            className='text-xs lg:text-sm cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors'
          >
            Đăng nhập
          </button>
          <button
            onClick={onSignUpClick || (() => console.log('Navigate to register'))}
            className='text-xs lg:text-sm cursor-pointer font-medium bg-[#1E3A8A] dark:bg-indigo-500 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-[#1E3A8A] transition-colors'
          >
            Đăng ký
          </button>
        </div>
      )}
    </div>
  );
};

export default DesktopMenu;
