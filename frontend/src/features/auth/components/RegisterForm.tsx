import CustomInput from '@/shared/common/CustomInput';
import { Lock, Mail, Store, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegister } from '../hooks/useRegister';
import { RegisterCustomerRequestSchema, RegisterVendorRequestSchema } from '../schemas/auth.schema';
import toast from 'react-hot-toast';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<'customer' | 'vendor'>('customer');
  const { mutate } = useRegister();

  const registerForm = useForm({
    resolver: zodResolver(
      accountType === 'customer' ? RegisterCustomerRequestSchema : RegisterVendorRequestSchema,
    ),
    defaultValues:
      accountType === 'customer'
        ? {
            name: '',
            email: '',
            password: '',
            confirm_password: '',
          }
        : {
            name: '',
            email: '',
            password: '',
            confirm_password: '',
            store_name: '',
          },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = registerForm;

  const handleSubmitRegister = (data: any) => {
    const result =
      accountType === 'customer'
        ? RegisterCustomerRequestSchema.safeParse(data)
        : RegisterVendorRequestSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const message = Object.values(errors).flat().filter(Boolean).join(', ');

      toast.error(message || 'Đăng ký thất bại');
      return;
    }

    try {
      mutate(result.data);
      toast.success('Đăng ký thành công');
      navigate('/');
    } catch (err: any) {
      toast.error(err || 'Đăng ký thất bại');
    }
    mutate(data);
  };

  return (
    <div className='max-w-lg mx-auto px-4 py-10'>
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
        <FormProvider {...registerForm}>
          <form className='space-y-5' onSubmit={handleSubmit(handleSubmitRegister)}>
            <CustomInput
              label='Họ và tên'
              type='text'
              placeholder='Nguyễn Văn A'
              icon={User}
              name='name'
              error={errors.name}
            />

            <CustomInput
              label='Email'
              type='email'
              autoComplete='email'
              placeholder='Nhập email...'
              icon={Mail}
              name='email'
              error={errors.email}
            />

            {accountType === 'vendor' && (
              <CustomInput
                label='Tên cửa hàng'
                type='text'
                placeholder='Tên shop của bạn...'
                icon={Store}
                name='store_name'
                error={errors.store_name}
              />
            )}

            <CustomInput
              label='Mật khẩu'
              type='password'
              autoComplete='current-password'
              placeholder='••••••••'
              icon={Lock}
              name='password'
            />

            <CustomInput
              label='Xác nhận mật khẩu'
              type='password'
              autoComplete='new-password'
              placeholder='••••••••'
              icon={Lock}
              name='confirm_password'
              error={errors.confirm_password}
            />

            <button
              type='submit'
              className='w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-[#1E3A8A] transition-colors'
            >
              Đăng ký {accountType === 'vendor' ? 'Cửa hàng' : 'Tài khoản'}
            </button>
          </form>
        </FormProvider>

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
  );
};

export default RegisterForm;
