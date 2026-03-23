import CustomInput from '@/components/common/CustomInput';
import { LoginRequestSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useLogin from '../hooks/useLogin';
import Header from '../components/Header';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading, error } = useLogin();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginRequestSchema),
  });

  const handleSubmitLogin = async (data: any) => {
    await login(data);
  };

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

          <form className='space-y-5' onSubmit={handleSubmit(handleSubmitLogin)}>
            <CustomInput
              label='Email'
              type='email'
              placeholder='you@example.com'
              icon={Mail}
              registration={register('email')}
              error={errors.email}
            />
            <CustomInput
              label='Mật khẩu'
              type='password'
              placeholder='••••••••'
              icon={Lock}
              registration={register('password')}
              error={errors.password}
            />

            <div>
              <div className='flex items-center justify-between'>
                <label className='flex items-center text-sm text-gray-600'>
                  <input type='checkbox' className='form-checkbox h-4 w-4' />
                  <span className='ml-2'>Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type='button'
                  onClick={() => navigate('/forgot-password')}
                  className='text-sm text-[#1E3A8A] font-medium hover:underline'
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>

            <button
              type='submit'
              className='w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors'
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {error && <div className='mt-4 text-center text-sm text-red-600'>{error}</div>}

          <div className='flex items-center gap-3 my-5 text-[11px] text-gray-400'>
            <div className='flex-1 h-px bg-gray-600' />
            <span>Hoặc đăng nhập với</span>
            <div className='flex-1 h-px bg-gray-600' />
          </div>

          <button
            type='button'
            onClick={loginWithGoogle}
            className='w-full border border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors'
          >
            <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
              <path
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                fill='#4285F4'
              />
              <path
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                fill='#34A853'
              />
              <path
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                fill='#FBBC05'
              />
              <path
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                fill='#EA4335'
              />
            </svg>
            Google
          </button>

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
