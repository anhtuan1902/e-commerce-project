import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { InfoAccountFormValues, InfoAccountSchema } from '../schemas/profiles.schema';
import CustomInput from '@/shared/common/CustomInput.js';
import CustomSelect from '@/shared/common/CustomSelect.js';
import { UserType } from '@/shared/types/global.types';

interface InfoAccountProps {
  currentUser: UserType | null;
  onSubmit: (data: InfoAccountFormValues) => Promise<void>;
  isLoading: boolean;
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const InfoAccount = ({ currentUser, onSubmit, isLoading }: InfoAccountProps) => {
  const defaultValues = useMemo<InfoAccountFormValues>(
    () => ({
      avatar: currentUser?.profile?.avatarUrl ?? '',
      name: currentUser?.profile?.name ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.profile?.phone ?? '',
      birthday: currentUser?.profile?.birthday ?? '',
      gender: (currentUser?.profile?.gender as 'male' | 'female' | 'other' | '' | null) ?? '',
    }),
    [currentUser],
  );

  const methods = useForm<InfoAccountFormValues>({
    defaultValues,
    resolver: zodResolver(InfoAccountSchema),
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  // Reset form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      reset(defaultValues);
    }
  }, [currentUser, defaultValues, reset]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Thông tin tài khoản</h2>
          <p className='text-gray-500'>Quản lý thông tin cá nhân của bạn</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <CustomInput
            label='Họ và tên'
            type='text'
            placeholder='Nhập họ và tên...'
            icon={User}
            name='name'
            error={errors.name}
          />

          <CustomInput
            label='Email'
            type='email'
            placeholder='Nhập email...'
            icon={User}
            name='email'
            error={errors.email}
            disabled
          />

          <CustomInput
            label='Số điện thoại'
            type='tel'
            placeholder='Nhập số điện thoại...'
            name='phone'
            error={errors.phone}
          />

          <CustomInput label='Ngày sinh' type='date' name='birthday' error={errors.birthday} />

          <CustomSelect
            label='Giới tính'
            name='gender'
            options={GENDER_OPTIONS}
            placeholder='Chọn giới tính...'
            error={errors.gender}
          />
        </div>

        <div className='flex justify-end pt-4'>
          <button
            type='submit'
            disabled={isLoading}
            className='bg-[#1E3A8A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#152d6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default InfoAccount;
