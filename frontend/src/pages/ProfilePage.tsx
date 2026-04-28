import SidebarProfile from '../features/profiles/components/SidebarProfile';
import RequestLogin from '../features/profiles/components/RequestLogin';
import InfoAccount from '../features/profiles/components/InfoAccount';
import ChangePassword from '../features/profiles/components/ChangePassword';
import Order from '../features/profiles/components/Order';
import Address from '../features/profiles/components/Address';
import useProfiles from '../features/profiles/hooks/useProfiles';
import { useAvatar } from '../features/profiles/hooks/useAvatar';

const ProfilePage = () => {
  const { currentUser, activeTab, setActiveTab, updateProfile, changePassword, isLoading } =
    useProfiles();

  const { fileInputRef, avatarPreview, selectedAvatar, handleAvatarClick, handleAvatarChange } =
    useAvatar();

  const onSubmitInfo = async (data: any) => {
    await updateProfile(data, selectedAvatar);
  };

  const onSubmitPassword = async (data: any) => {
    await changePassword(data);
  };

  if (!currentUser) {
    return <RequestLogin />;
  }

  const avatarInitial = currentUser?.profile?.name?.charAt(0).toUpperCase() || '';

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAvatarChange(e);
  };

  return (
    <div className='max-w-7xl mx-auto flex flex-col md:flex-row gap-8'>
      <SidebarProfile
        user={currentUser}
        avatarPreview={avatarPreview}
        avatarInitial={avatarInitial}
        activeTab={activeTab}
        onAvatarClick={handleAvatarClick}
        onAvatarChange={onAvatarChange}
        onTabChange={setActiveTab}
        fileInputRef={fileInputRef}
      />

      <div className='flex-1'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-125'>
          {activeTab === 'info' && (
            <InfoAccount currentUser={currentUser} onSubmit={onSubmitInfo} isLoading={isLoading} />
          )}

          {activeTab === 'addresses' && <Address />}

          {activeTab === 'password' && (
            <ChangePassword
              onSubmit={onSubmitPassword}
              noPassword={currentUser?.no_password}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'orders' && <Order orders={[]} />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
