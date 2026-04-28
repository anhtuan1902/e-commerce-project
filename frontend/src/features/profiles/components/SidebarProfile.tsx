import { Camera, ClipboardList, Key, MapPin, User } from 'lucide-react';
import { UserType } from '@/shared/types/global.types';
import { ActiveTab } from '../constants/profiles.constants';

interface SidebarProfileProps {
  user: UserType | null;
  avatarPreview: string | null;
  avatarInitial: string;
  activeTab: ActiveTab;
  onAvatarClick: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTabChange: (tab: ActiveTab) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const SidebarProfile = ({
  user,
  avatarPreview,
  avatarInitial,
  activeTab,
  onAvatarClick,
  onAvatarChange,
  onTabChange,
  fileInputRef,
}: SidebarProfileProps) => {
  return (
    <div className='w-full md:w-64 shrink-0'>
      <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-6 text-center border-b border-gray-200 bg-gray-50'>
          <div className='relative inline-block'>
            <div className='h-24 w-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-[#1E3A8A] font-bold text-3xl border-4 border-white shadow-md overflow-hidden'>
              {avatarPreview ? (
                <img src={avatarPreview} alt='avatar' className='w-full h-full object-cover' />
              ) : (
                avatarInitial
              )}
            </div>
            <button
              className='absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-[#1E3A8A] transition-colors'
              onClick={onAvatarClick}
            >
              <Camera className='h-4 w-4' />
            </button>
            <input
              ref={fileInputRef}
              id='avatar-input'
              type='file'
              accept='image/*'
              onChange={onAvatarChange}
              className='hidden'
            />
          </div>
          <h3 className='mt-4 font-bold text-gray-900 text-lg'>{user?.profile?.name}</h3>
          <p className='text-sm text-gray-500'>{user?.email}</p>
        </div>

        <nav className='p-2 space-y-1'>
          <button
            onClick={() => onTabChange('info')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'info' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <User className='h-5 w-5 mr-3' /> Thông tin tài khoản
          </button>
          <button
            onClick={() => onTabChange('addresses')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'addresses' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <MapPin className='h-5 w-5 mr-3' /> Sổ địa chỉ
          </button>
          <button
            onClick={() => onTabChange('orders')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <ClipboardList className='h-5 w-5 mr-3' /> Đơn hàng của tôi
          </button>
          <button
            onClick={() => onTabChange('password')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'password' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Key className='h-5 w-5 mr-3' /> Đổi mật khẩu
          </button>
        </nav>
      </div>
    </div>
  );
};

export default SidebarProfile;
