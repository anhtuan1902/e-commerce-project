import CustomDateTimePicker from '@/components/common/CustomDateTimePicker';
import CustomInput from '@/components/common/CustomInput';
import CustomSelect from '@/components/common/CustomSelect';
import { CalendarDays, Mail, Phone, User } from 'lucide-react';

const InfoAccount = ({ handleSubmit, errors }: { handleSubmit: any; errors: any }) => {
  return (
    <div>
      <h2 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-4'>Hồ sơ của tôi</h2>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-2 sm:grid-cols-2 mb-0 space-x-3'>
          <div className='sm:col-span-1'>
            <CustomInput
              label='Họ và tên'
              type='text'
              icon={User}
              name='name'
              error={errors.name}
            />
          </div>
          <div className='sm:col-span-1'>
            <CustomInput
              label='Email (Không thể thay đổi)'
              type='email'
              icon={Mail}
              disabled
              name='email'
              error={errors.email}
            />
          </div>
          <div className='sm:col-span-2'>
            <CustomInput
              label='Số điện thoại'
              type='tel'
              icon={Phone}
              name='phone_number'
              error={errors.phone_number}
            />
          </div>
          <div className='sm:col-span-2'>
            <CustomDateTimePicker
              label='Ngày sinh'
              format='YYYY-MM-DD'
              icon={CalendarDays}
              name='birthday'
              error={errors.birthday}
            />
          </div>
          <div className='sm:col-span-2 me-3'>
            <CustomSelect
              label='Giới tính'
              options={[
                { value: 'male', label: 'Nam' },
                { value: 'female', label: 'Nữ' },
                { value: 'other', label: 'Khác' },
              ]}
              icon={User}
              name='gender'
              error={errors.gender}
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
