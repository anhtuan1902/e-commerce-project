import { useAuthStore } from '@/store/auth.store';
import { useRef, useCallback, useEffect, useState } from 'react';

interface UseAvatarReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  avatarPreview: string | null;
  setAvatarPreview: (url: string | null) => void;
  selectedAvatar: File | null;
  setSelectedAvatar: (file: File | null) => void;
  handleAvatarClick: () => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>, onChange?: (url: string) => void) => void;
}

export const useAvatar = (): UseAvatarReturn => {
  const currentUser = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.profile?.avatarUrl || null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange?: (url: string) => void) => {
      e.preventDefault();
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedAvatar(file);
      const link_avatar = URL.createObjectURL(file);
      setAvatarPreview(link_avatar);
      onChange?.(link_avatar);

      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
      avatarObjectUrlRef.current = link_avatar;
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  return {
    fileInputRef,
    avatarPreview,
    setAvatarPreview,
    selectedAvatar,
    setSelectedAvatar,
    handleAvatarClick,
    handleAvatarChange,
  };
};
