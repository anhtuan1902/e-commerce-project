import CustomInput from '@/components/common/CustomInput';
import { ChangePasswordSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

const ChangePassword = ({ onSubmit, noPassword }: { onSubmit: any; noPassword: boolean }) => {
  const changePasswordMethods = useForm({
    defaultValues: {
      password: '',
      new_password: '',
      confirm_password: '',
    },
    resolver: zodResolver(ChangePasswordSchema(noPassword)),
  });

  const {
    handleSubmit,
    formState: { errors },
  } = changePasswordMethods;

  return (
    <div>
      <h2 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-4'>Bảo mật tài khoản</h2>
      <FormProvider {...changePasswordMethods}>
        <form
          onSubmit={handleSubmit(async (data) => {
            try {
              await onSubmit(data); // Giả sử onSubmit throw error nếu thất bại
              changePasswordMethods.reset(); // Luôn reset nếu không có lỗi
            } catch (error) {
              // Xử lý lỗi, không reset
            }
          })}
          className='max-w-md space-y-5'
        >
          {!noPassword && (
            <CustomInput
              label='Mật khẩu cũ'
              type='password'
              placeholder='••••••••'
              name='password'
              error={errors.password}
            />
          )}
          <CustomInput
            label='Mật khẩu mới'
            type='password'
            placeholder='••••••••'
            name='new_password'
            error={errors.new_password}
          />

          <CustomInput
            label='Xác nhận mật khẩu mới'
            type='password'
            placeholder='••••••••'
            name='confirm_password'
            error={errors.confirm_password}
          />

          <div className='pt-4'>
            <button
              type='submit'
              className='bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm'
            >
              Cập Nhật Mật Khẩu
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ChangePassword;
