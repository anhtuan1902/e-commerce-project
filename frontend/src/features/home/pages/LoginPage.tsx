import { Eye, EyeClosed, Lock, Mail, Store } from 'lucide-react';
import Header from '../components/Header';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);

  return (
    <>
      <Header />

      <div className='max-w-md mx-auto px-4 py-20'>
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-8'>
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-[#1E3A8A] mb-4'>
              <Store className='h-8 w-8' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900'>Chào mừng trở lại</h2>
            <p className='text-gray-500 mt-2'>Đăng nhập để tiếp tục mua sắm hoặc bán hàng</p>
          </div>

          <form
            className='space-y-5'
            onSubmit={(e) => {
              e.preventDefault();
              console.log('Login attempt:', { email, password });
              // Thêm logic đăng nhập ở đây
            }}
          >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none'
                  placeholder='you@example.com'
                />
              </div>
            </div>

            <div>
              <div className='flex justify-between items-center mb-1'>
                <label className='block text-sm font-medium text-gray-700'>Mật khẩu</label>
                <a href='#' className='text-xs text-[#1E3A8A] hover:text-indigo-800 font-medium'>
                  Quên mật khẩu?
                </a>
              </div>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type={isShowPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none'
                  placeholder='••••••••'
                />
                <button
                  type='button'
                  onClick={() => setIsShowPassword(!isShowPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none'
                >
                  {isShowPassword ? (
                    <Eye className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                  ) : (
                    <EyeClosed className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                  )}
                </button>
              </div>
            </div>

            <button
              type='submit'
              className='w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors'
            >
              Đăng nhập
            </button>
          </form>

          <div className='mt-6 text-center text-sm text-gray-600'>
            Chưa có tài khoản?{' '}
            <button
              onClick={() => navigate('/register')}
              className='text-[#1E3A8A] font-bold hover:underline'
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
