import { useState } from 'react';
import Header from '../components/Header';
import { Lock, Mail, Store, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('customer');

  return (
    <>
      <Header />

      <div className='max-w-lg mx-auto px-4 py-20'>
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-2xl font-bold text-gray-900'>Tạo tài khoản mới</h2>
            <p className='text-gray-500 mt-2'>Tham gia cộng đồng mua bán của chúng tôi</p>
          </div>

          <div className='flex p-1 bg-gray-100 rounded-xl mb-6'>
            <button
              type='button'
              onClick={() => setAccountType('customer')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${accountType === 'customer' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tôi là Người mua
            </button>
            <button
              type='button'
              onClick={() => setAccountType('vendor')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${accountType === 'vendor' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tôi là Người bán
            </button>
          </div>

          <form
            className='space-y-5'
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Họ và tên</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  required
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none'
                  placeholder='Nguyễn Văn A'
                />
              </div>
            </div>

            {accountType === 'vendor' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Tên cửa hàng</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Store className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    required
                    className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none'
                    placeholder='Tên shop của bạn...'
                  />
                </div>
              </div>
            )}

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  required
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none'
                  placeholder='you@example.com'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Mật khẩu</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='password'
                  required
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none'
                  placeholder='••••••••'
                />
              </div>
            </div>

            <button
              type='submit'
              className='w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-[#1E3A8A] transition-colors'
            >
              Đăng ký {accountType === 'vendor' ? 'Cửa hàng' : 'Tài khoản'}
            </button>
          </form>

          <div className='mt-6 text-center text-sm text-gray-600'>
            Đã có tài khoản?{' '}
            <button
              onClick={() => navigate('/login')}
              className='text-[#1E3A8A] font-bold hover:underline'
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
