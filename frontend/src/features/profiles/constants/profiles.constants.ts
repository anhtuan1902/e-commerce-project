import { User } from '@/shared/types/global.types';

export type ActiveTab = 'info' | 'addresses' | 'orders' | 'password';

export interface ProfileState {
  currentUser: User | null;
  avatarPreview: string | null;
  selectedAvatar: File | null;
  activeTab: ActiveTab;
  isLoading: boolean;
}

export const TAB_LABELS: Record<ActiveTab, string> = {
  info: 'Thông tin tài khoản',
  addresses: 'Sổ địa chỉ',
  orders: 'Đơn hàng của tôi',
  password: 'Đổi mật khẩu',
};
