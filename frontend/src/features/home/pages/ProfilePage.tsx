import { useAppSelector } from '@/hooks';
import { AlertCircle, Camera, ChevronRight, ClipboardList, Key, Package, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoAccount from '../components/InfoAccount';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'orders'>('info');
  const currentUser = useAppSelector((state) => state.auth.user);

  const MOCK_ORDERS = [
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
    {
      id: '#ORD-001',
      customer: 'Lê Hoàng',
      total: 299.99,
      date: '12/03/2026',
      status: 'Chờ xử lý',
    },
    {
      id: '#ORD-002',
      customer: 'Phạm Trang',
      total: 64.0,
      date: '11/03/2026',
      status: 'Đã giao hàng',
    },
  ];

  if (!currentUser) {
    return (
      <div className='flex flex-col items-center justify-center h-[60vh] text-center px-4'>
        <AlertCircle className='h-16 w-16 text-gray-400 mb-4' />
        <h2 className='text-2xl font-bold text-gray-900'>Yêu cầu đăng nhập</h2>
        <p className='text-gray-500 mt-2 mb-6'>Vui lòng đăng nhập để xem hồ sơ của bạn.</p>
        <button
          onClick={() => navigate('/login')}
          className='bg-[#1E3A8A] text-white px-6 py-2 rounded-lg font-medium'
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cập nhật thông tin thành công!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Đổi mật khẩu thành công!');
    // Logic đổi mật khẩu thực tế sẽ ở đây
  };
  return (
    <div className='max-w-7xl mx-auto flex flex-col md:flex-row gap-8'>
      {/* Sidebar Profile */}
      <div className='w-full md:w-64 flex-shrink-0'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-6 text-center border-b border-gray-200 bg-gray-50'>
            <div className='relative inline-block'>
              <div className='h-24 w-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-[#1E3A8A] font-bold text-3xl border-4 border-white shadow-md overflow-hidden'>
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt='avatar'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <button
                className='absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-[#1E3A8A] transition-colors'
                onClick={() => {
                  // Handle avatar update
                }}
              >
                <Camera className='h-4 w-4' />
              </button>
            </div>
            <h3 className='mt-4 font-bold text-gray-900 text-lg'>{currentUser.name}</h3>
            <p className='text-sm text-gray-500'>{currentUser.email}</p>
          </div>

          <nav className='p-2 space-y-1'>
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'info' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <User className='h-5 w-5 mr-3' /> Thông tin tài khoản
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <ClipboardList className='h-5 w-5 mr-3' /> Đơn hàng của tôi
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'password' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Key className='h-5 w-5 mr-3' /> Đổi mật khẩu
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[500px]'>
          {/* Tab: Thông tin tài khoản */}
          {activeTab === 'info' && <InfoAccount handleSubmitAccount={handleUpdateInfo} />}

          {/* Tab: Đổi mật khẩu */}
          {activeTab === 'password' && (
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-4'>
                Bảo mật tài khoản
              </h2>
              <form onSubmit={handleUpdatePassword} className='max-w-md space-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type='password'
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl '
                    placeholder='••••••••'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Mật khẩu mới
                  </label>
                  <input
                    type='password'
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl'
                    placeholder='••••••••'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type='password'
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl '
                    placeholder='••••••••'
                  />
                </div>
                <div className='pt-4'>
                  <button
                    type='submit'
                    className='bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm'
                  >
                    Cập Nhật Mật Khẩu
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Đơn hàng */}
          {activeTab === 'orders' && (
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-4'>
                Lịch sử đơn hàng
              </h2>
              {/* croll when too long */}
              <div className='space-y-4 max-h-[500px] overflow-y-auto'>
                {MOCK_ORDERS.map((order) => (
                  <div
                    key={order.id}
                    className='bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow'
                  >
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4'>
                      <div>
                        <span className='font-bold text-[#1E3A8A]'>{order.id}</span>
                        <span className='text-gray-500 text-sm ml-3'>Đặt ngày: {order.date}</span>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'Đã giao hàng'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'Đang giao'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className='flex justify-between items-center pt-4 border-t border-gray-100'>
                      <div className='text-sm text-gray-600'>
                        Tổng tiền:{' '}
                        <span className='font-bold text-gray-900 text-lg ml-1'>
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                      <button className='text-[#1E3A8A] font-medium text-sm hover:text-indigo-800 flex items-center'>
                        Xem chi tiết <ChevronRight className='h-4 w-4 ml-1' />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Empty state nếu không có đơn hàng */}
                {MOCK_ORDERS.length === 0 && (
                  <div className='text-center py-12'>
                    <Package className='h-12 w-12 text-gray-300 mx-auto mb-3' />
                    <p className='text-gray-500'>Bạn chưa có đơn hàng nào.</p>
                    <button
                      onClick={() => navigate('/')}
                      className='mt-4 text-[#1E3A8A] font-medium hover:underline'
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
