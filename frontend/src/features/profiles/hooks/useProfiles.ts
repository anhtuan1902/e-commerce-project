import { useAuthStore } from '@/store/auth.store';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
  changePassword as changePasswordApi,
  updateProfile as updateProfileApi,
} from '../api/profiles.api';
import { ActiveTab } from '../constants/profiles.constants';
import useGetProfile from '@/features/auth/hooks/useGetProfile';

export const useProfiles = () => {
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const { mutate: getMe } = useGetProfile();


  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return updateProfileApi(formData);
    },
    onSuccess: (data) => {
      if (currentUser) {
        setUser({ ...currentUser, profile: data.data });
      }
      toast.success('Cập nhật hồ sơ thành công');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công');
      // call get me
      getMe();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    },
  });

  const updateProfile = useCallback(
    async (data: Record<string, unknown>, selectedAvatar: File | null) => {
      const formData = new FormData();
      const { user } = useAuthStore.getState();
      const profile = user?.profile || {};

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'avatar') {
          if (selectedAvatar) {
            formData.append('avatar', selectedAvatar);
          }
        } else if (value !== undefined && value !== null && value !== '') {
          const hasChanged = profile[key as keyof typeof profile] !== value;
          if (hasChanged) {
            formData.append(key, value as string);
          }
        }
      });

      const hasChanges = [...formData.entries()].length > 0 || !!selectedAvatar;
      if (!hasChanges) {
        toast.success('Không có thay đổi nào để cập nhật');
        return Promise.resolve();
      }

      return updateProfileMutation.mutateAsync(formData);
    },
    [updateProfileMutation],
  );

  const changePassword = useCallback(
    async (data: { password: string; new_password: string; confirm_password: string }) => {
      return changePasswordMutation.mutateAsync(data);
    },
    [changePasswordMutation],
  );

  return {
    currentUser,
    activeTab,
    setActiveTab,
    updateProfile,
    changePassword,
    isLoading: updateProfileMutation.isPending || changePasswordMutation.isPending,
  };
};

export default useProfiles;
