import { Store, MessageSquare } from 'lucide-react';

interface ShopProfileProps {
  vendorName: string;
  logoUrl?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
}

const ShopProfile = ({
  vendorName,
  logoUrl,
  description,
  contactEmail,
  contactPhone,
  address,
  status,
  createdAt,
}: ShopProfileProps) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6 mb-6'>
      <div className='flex items-center gap-4 border-r border-gray-200 pr-8 w-full md:w-auto'>
        <div className='h-16 w-16 bg-gray-200 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-500 overflow-hidden shrink-0 relative'>
          {logoUrl ? (
            <img src={logoUrl} alt={vendorName} className='w-full h-full object-cover' />
          ) : (
            <Store className='h-8 w-8 text-gray-400' />
          )}
          <span className='absolute bottom-0 bg-blue-600 text-white text-[9px] w-full text-center uppercase tracking-wider font-bold'>
            Mall
          </span>
        </div>
        <div>
          <h3 className='font-bold text-gray-900 text-lg'>{vendorName}</h3>
          <p className='text-xs text-gray-500 mb-2'>
            {status === 'active' ? 'Đang hoạt động' : status || 'Offline'}
            {createdAt && ` • Tham gia ${formatDate(createdAt)}`}
          </p>
          <div className='flex gap-2'>
            <button className='border border-[#1E3A8A] text-[#1E3A8A] bg-indigo-50 px-3 py-1 text-xs font-medium rounded flex items-center'>
              <MessageSquare className='h-3 w-3 mr-1' /> Chat Ngay
            </button>
            <button className='border border-gray-300 text-gray-700 px-3 py-1 text-xs font-medium rounded flex items-center hover:bg-gray-50'>
              <Store className='h-3 w-3 mr-1' /> Xem Shop
            </button>
          </div>
        </div>
      </div>
      <div className='flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm w-full'>
        {contactEmail && (
          <div>
            <span className='text-gray-500'>Email</span>
            <span className='text-[#1E3A8A] font-medium md:block ml-2'>{contactEmail}</span>
          </div>
        )}
        {contactPhone && (
          <div>
            <span className='text-gray-500'>Điện thoại</span>
            <span className='text-[#1E3A8A] font-medium md:block ml-2'>{contactPhone}</span>
          </div>
        )}
        {address && (
          <div>
            <span className='text-gray-500'>Địa chỉ</span>
            <span className='text-[#1E3A8A] font-medium md:block ml-2 truncate' title={address}>
              {address}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProfile;
