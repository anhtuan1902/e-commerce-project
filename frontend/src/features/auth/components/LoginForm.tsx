import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema } from '../schemas/auth.schema';
import { Lock, Mail, Store } from 'lucide-react';
import CustomInput from 'src/shared/common/CustomInput';
import { GoogleLoginButton } from './GoogleLoginButton';

const LoginForm = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useLogin();

  const loginForm = useForm({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const {
    handleSubmit,
    formState: { errors },
  } = loginForm;

  const handleSubmitLogin = (data: any) => {
    mutate(data);
  };

  return (
    <FormProvider {...loginForm}>
      <div className='max-w-md mx-auto px-4 py-10'>
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
              name='email'
              error={errors.email}
            />
            <CustomInput
              label='Mật khẩu'
              type='password'
              placeholder='••••••••'
              icon={Lock}
              name='password'
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
                  onClick={() => console.log('Forgot password clicked')}
                  className='text-sm text-[#1E3A8A] font-medium hover:underline'
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>

            <button
              type='submit'
              className='w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors'
              disabled={isPending}
            >
              {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className='flex items-center gap-3 my-5 text-[11px] text-gray-400'>
            <div className='flex-1 h-px bg-gray-600' />
            <span>Hoặc đăng nhập với</span>
            <div className='flex-1 h-px bg-gray-600' />
          </div>

          <GoogleLoginButton />

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
    </FormProvider>
  );
};

export default LoginForm;
