import { InfoAccountSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Camera, ClipboardList, Key, MapPin, User } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';
import InfoAccount from '../components/InfoAccount';
import Order from '../components/Order';
import useProfiles from '../hooks/useProfiles';
import Address from '../components/Address';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);

  const {
    updateProfile,
    currentUser,
    setSelectedAvatar,
    avatarPreview,
    setAvatarPreview,
    activeTab,
    setActiveTab,
    changePassword,
  } = useProfiles();

  const defaultInfoValues = useMemo<InfoAccountFormValues>(
    () => ({
      avatar: currentUser?.profile?.avatarUrl ?? '',
      name: currentUser?.profile?.name ?? '',
      email: currentUser?.email ?? '',
      phone_number: currentUser?.profile?.phone ?? '',
      birthday: currentUser?.profile?.birthday ?? '',
      gender: (currentUser?.profile?.gender as 'male' | 'female' | 'other' | '' | null) ?? '',
    }),
    [currentUser],
  );

  type InfoAccountFormValues = z.infer<typeof InfoAccountSchema>;

  const infoFormMethods = useForm<InfoAccountFormValues>({
    defaultValues: defaultInfoValues as InfoAccountFormValues,
    resolver: zodResolver(InfoAccountSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (currentUser) {
      infoFormMethods.reset(defaultInfoValues);
    }
  }, [currentUser, defaultInfoValues, infoFormMethods]);

  const {
    handleSubmit: onSubmitInfo,
    formState: { errors: errorsInfo },
    setValue: setValueInfo,
  } = infoFormMethods;

  const handleSubmitInfo = useCallback(
    async (data: any) => {
      await updateProfile(data);
    },
    [updateProfile],
  );

  if (!currentUser) {
    return (
      <div className='flex flex-col items-center justify-center h-[60vh] text-center px-4'>
        <AlertCircle className='h-16 w-16 text-gray-400 mb-4' />
        <h2 className='text-2xl font-bold text-gray-900'>Yêu cầu đăng nhập</h2>
        <p className='text-gray-500 mt-2 mb-6'>Vui lòng đăng nhập để xem hồ sơ của bạn.</p>
        <button
          onClick={() => navigate('/login')}
          className='bg-[#1E3A8A] text-white px-6 py-2 rounded-lg font-medium'
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  const profileName = currentUser?.profile?.name ?? '';
  const avatarInitial = useMemo(
    () => (profileName ? profileName.charAt(0).toUpperCase() : ''),
    [profileName],
  );

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      setSelectedAvatar(file);
      const link_avatar = URL.createObjectURL(file);
      setAvatarPreview(link_avatar);
      setValueInfo('avatar', link_avatar);

      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
      avatarObjectUrlRef.current = link_avatar;
    },
    [setSelectedAvatar, setAvatarPreview, setValueInfo],
  );

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpdatePassword = useCallback(
    async (data: any) => {
      await changePassword(data);
    },
    [changePassword],
  );

  return (
    <div className='max-w-7xl mx-auto flex flex-col md:flex-row gap-8'>
      {/* Sidebar Profile */}
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
                onClick={handleAvatarClick}
              >
                <Camera className='h-4 w-4' />
              </button>
              <input
                ref={fileInputRef}
                id='avatar-input'
                type='file'
                accept='image/*'
                onChange={handleAvatarChange}
                className='hidden'
              />
            </div>
            <h3 className='mt-4 font-bold text-gray-900 text-lg'>{currentUser?.profile?.name}</h3>
            <p className='text-sm text-gray-500'>{currentUser?.email}</p>
          </div>

          <nav className='p-2 space-y-1'>
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'info' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <User className='h-5 w-5 mr-3' /> Thông tin tài khoản
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'addresses' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <MapPin className='h-5 w-5 mr-3' /> Sổ địa chỉ
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <ClipboardList className='h-5 w-5 mr-3' /> Đơn hàng của tôi
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'password' ? 'bg-indigo-50 text-[#1E3A8A]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Key className='h-5 w-5 mr-3' /> Đổi mật khẩu
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-125'>
          {/* Tab: Thông tin tài khoản */}
          {activeTab === 'info' && (
            <FormProvider {...infoFormMethods}>
              <InfoAccount handleSubmit={onSubmitInfo(handleSubmitInfo)} errors={errorsInfo} />
            </FormProvider>
          )}

          {/* Tab: Địa chỉ */}
          {activeTab === 'addresses' && <Address />}

          {/* Tab: Đổi mật khẩu */}
          {activeTab === 'password' && (
            <ChangePassword
              onSubmit={handleUpdatePassword}
              noPassword={currentUser?.no_password || false}
            />
          )}

          {/* Tab: Đơn hàng */}
          {activeTab === 'orders' && <Order orders={[]} />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
