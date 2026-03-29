import CustomInput from '@/components/common/CustomInput';
import { useAppSelector } from '@/hooks';
import { InfoAccountSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import { useForm } from 'react-hook-form';

const InfoAccount = ({ handleSubmitAccount }: { handleSubmitAccount: (data: any) => void }) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone_number: currentUser?.phone || '',
      address: currentUser?.address || '',
    },
    resolver: zodResolver(InfoAccountSchema),
  });

  const onSubmit = async (data: any) => {
    await handleSubmitAccount(data);
  };

  return (
    <div>
      <h2 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-4'>Hồ sơ của tôi</h2>
      <form onSubmit={handleSubmit(onSubmit)} className='max-w-2xl space-y-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 mb-0'>
          <div className='sm:col-span-2'>
            <CustomInput
              label='Họ và tên'
              type='text'
              icon={User}
              registration={register('name')}
              error={errors.name}
            />
          </div>
          <div className='sm:col-span-2'>
            <CustomInput
              label='Email (Không thể thay đổi)'
              type='email'
              icon={Mail}
              disabled
              registration={register('email')}
              error={errors.email}
            />
          </div>
          <div className='sm:col-span-2'>
            <CustomInput
              label='Số điện thoại'
              type='tel'
              icon={Phone}
              registration={register('phone_number')}
              error={errors.phone_number}
            />
          </div>
          <div className='sm:col-span-2'>
            <CustomInput
              label='Địa chỉ giao hàng mặc định'
              type='text'
              icon={MapPin}
              registration={register('address')}
              error={errors.address}
            />
          </div>
        </div>
        <div>
          <button
            type='submit'
            className='bg-[#1E3A8A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1E3A8A] transition-colors shadow-sm'
          >
            Lưu Thay Đổi
          </button>
        </div>
      </form>
    </div>
  );
};

export default InfoAccount;
