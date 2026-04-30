import useLogout from '@/features/auth/hooks/useLogout';
import { ROUTES } from '@/shared/constants/routes.constants';
import { getRefreshToken, removeTokens } from '@/shared/services/jwt.services';
import { convertCurrency } from '@/shared/utils/convertCurrency';
import useCheckRole from '@/shared/utils/useCheckRole';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { Avatar, Dropdown, Space } from 'antd';
import { LogOut, Minus, Plus, ShoppingCart, Trash2, User, User2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DesktopMenu = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { mutate } = useLogout();
  const isVendor = useCheckRole({ role: 'vendor' });

  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  const handleLoginClick = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleRegisterClick = () => {
    navigate(ROUTES.REGISTER);
  };

  const handleCartClick = () => {
    navigate(ROUTES.CART);
  };

  const handleRemoveItem = (id: number) => {
    removeItem(id);
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    updateQuantity(id, delta);
  };

  const cartDropdownContent = (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80'>
      <div className='p-3 border-b border-gray-200 dark:border-gray-700'>
        <h3 className='font-semibold text-gray-800 dark:text-white'>Giỏ hàng của bạn</h3>
      </div>
      {cartItems.length === 0 ? (
        <div className='p-6 text-center'>
          <ShoppingCart className='mx-auto h-12 w-12 text-gray-400 mb-3' />
          <p className='text-gray-500 dark:text-gray-400 text-sm'>Giỏ hàng trống</p>
        </div>
      ) : (
        <>
          <div className='max-h-64 overflow-y-auto'>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className='p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 flex gap-3'
              >
                <div className='w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex-shrink-0 overflow-hidden'>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className='w-full h-full object-cover'
                    />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-800 dark:text-white truncate'>
                    {item.name}
                  </p>
                  <p className='text-sm text-[#1E3A8A] dark:text-indigo-400 font-semibold mt-1'>
                    {convertCurrency(item.price)}
                  </p>
                  <div className='flex items-center gap-2 mt-2'>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, - 1)}
                      className='w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                    >
                      <Minus size={12} />
                    </button>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300 w-6 text-center'>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, + 1)}
                      className='w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className='ml-auto text-gray-400 hover:text-red-500 transition-colors'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'>
            <div className='flex justify-between items-center mb-3'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>Tổng cộng:</span>
              <span className='text-lg font-bold text-[#1E3A8A] dark:text-indigo-400'>
                {convertCurrency(totalPrice)}
              </span>
            </div>
            <button
              onClick={() => navigate(ROUTES.CART)}
              className='w-full py-2 bg-[#1E3A8A] dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-[#1E3A8A] transition-colors'
            >
              Thanh toán
            </button>
          </div>
        </>
      )}
    </div>
  );

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
      onClick: () => handleCartClick(),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut className='mr-2' size={16} />,
      onClick: () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          toast.error('Không tìm thấy refresh token');
          logout();
          removeTokens();
          return;
        }
        mutate(refreshToken);
      },
    },
  ];

  return (
    <div className='hidden md:flex items-center space-x-4 lg:space-x-6'>
      {isVendor && (
        <>
          <button
            onClick={() => navigate('/')}
            className='text-xs lg:text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-indigo-400'
          >
            Chợ điện tử
          </button>
          <button
            onClick={() => navigate('/vendor')}
            className='text-xs lg:text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-indigo-400'
          >
            Kênh Người Bán
          </button>
        </>
      )}

      <Dropdown
        popupRender={() => cartDropdownContent}
        trigger={['hover']}
        placement='bottomRight'
        arrow={{ pointAtCenter: true }}
      >
        <div className='relative cursor-pointer' onClick={handleCartClick}>
          <ShoppingCart className='h-5 lg:h-6 w-5 lg:w-6 text-gray-600 dark:text-gray-400 hover:text-[#1E3A8A] dark:hover:text-indigo-400 transition-colors' />
          {totalItems > 0 && (
            <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
              {totalItems}
            </span>
          )}
        </div>
      </Dropdown>
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
            className='text-xs lg:text-sm cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-indigo-400'
          >
            Đăng nhập
          </button>
          <button
            onClick={handleRegisterClick}
            className='text-xs lg:text-sm cursor-pointer font-medium bg-[#1E3A8A] dark:bg-indigo-500 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-[#1E3A8A]'
          >
            Đăng ký
          </button>
        </div>
      )}
    </div>
  );
};

export default DesktopMenu;
