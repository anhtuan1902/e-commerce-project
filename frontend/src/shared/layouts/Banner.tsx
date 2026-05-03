import { useAuthStore } from '@/store/auth.store';
import { Store } from 'lucide-react';

const Banner = () => {
  const currentUser = useAuthStore((state) => state.user);

  return (
    <div className='bg-gradient-to-r from-[#1E3A8A] to-purple-600 rounded-2xl  p-8 text-white flex justify-between items-center shadow-lg'>
      <div>
        <h1 className='text-3xl font-bold mb-2'>
          {currentUser?.profile?.name
            ? `Chào mừng trở lại, ${currentUser?.profile?.name}!`
            : 'Khám phá hàng ngàn sản phẩm'}
        </h1>
        <p className='text-indigo-100'>
          {currentUser?.role === 'vendor'
            ? 'Xem các sản phẩm đang hot để tối ưu gian hàng của bạn.'
            : 'Từ các nhà cung cấp uy tín nhất trên toàn cầu.'}
        </p>
      </div>
      <div className='hidden md:block'>
        <Store className='h-24 w-24 text-white' />
      </div>
    </div>
  );
};

export default Banner;
