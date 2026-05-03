import { Lock } from 'lucide-react';
import CustomInput from '@/shared/common/CustomInput';
import {
  ChangePasswordFormValues,
  ChangePasswordFormValuesNoPassword,
  ChangePasswordSchema,
  ChangePasswordSchemaNoPassword,
} from '../schemas/profiles.schema';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface ChangePasswordProps {
  onSubmit: (data: ChangePasswordFormValues | ChangePasswordFormValuesNoPassword) => Promise<void>;
  noPassword?: boolean;
  isLoading?: boolean;
}

const ChangePassword = ({ onSubmit, noPassword = false, isLoading }: ChangePasswordProps) => {
  const methods = useForm<ChangePasswordFormValues | ChangePasswordFormValuesNoPassword>({
    resolver: zodResolver(noPassword ? ChangePasswordSchemaNoPassword : ChangePasswordSchema),
    mode: 'onBlur',
  });

  const { handleSubmit } = methods;

  const handleFormSubmit = handleSubmit(async (data) => {
    if (noPassword) {
      await onSubmit({ ...data, password: '' });
    } else {
      await onSubmit(data);
    }
    methods.reset({
      ...(noPassword
        ? { new_password: '', confirm_password: '' }
        : { password: '', new_password: '', confirm_password: '' }),
    });
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit} className='space-y-6'>
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Đổi mật khẩu</h2>
          <p className='text-gray-500'>Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
        </div>

        <div className='max-w-lg space-y-5'>
          {!noPassword && (
            <CustomInput
              label='Mật khẩu hiện tại'
              type='password'
              placeholder='Nhập mật khẩu hiện tại...'
              icon={Lock}
              name='password'
            />
          )}
          <CustomInput
            label='Mật khẩu mới'
            type='password'
            placeholder='Nhập mật khẩu mới...'
            icon={Lock}
            name='new_password'
          />

          <CustomInput
            label='Xác nhận mật khẩu mới'
            type='password'
            placeholder='Nhập lại mật khẩu mới...'
            icon={Lock}
            name='confirm_password'
          />
        </div>

        <div className='flex justify-start pt-4'>
          <button
            type='submit'
            disabled={isLoading}
            className='bg-[#1E3A8A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#152d6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Đang xử lý...' : noPassword ? 'Đặt mật khẩu' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ChangePassword;
