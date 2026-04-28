import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

interface ConfirmModalProps {
  title?: string;
  content: React.ReactNode;
  okText?: string;
  cancelText?: string;
  okButtonProps?: React.ComponentPropsWithoutRef<typeof Modal>['okButtonProps'];
  cancelButtonProps?: React.ComponentPropsWithoutRef<typeof Modal>['cancelButtonProps'];
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

const { confirm: antConfirm } = Modal;

export const showConfirm = (props: ConfirmModalProps) => {
  const {
    title = 'Xác nhận',
    content,
    okText = 'Đồng ý',
    cancelText = 'Hủy',
    okButtonProps,
    cancelButtonProps,
    onOk,
    onCancel,
  } = props;

  antConfirm({
    title,
    icon: <ExclamationCircleFilled className='text-[#FAAD14]' />,
    content,
    okText,
    cancelText,
    okButtonProps: {
      ...okButtonProps,
      className: `${okButtonProps?.className ?? ''} bg-[#1E3A8A]`.trim(),
    },
    cancelButtonProps,
    onOk,
    onCancel,
  });
};

export const showDeleteConfirm = (
  content: React.ReactNode = 'Bạn có chắc chắn muốn xóa không?',
  onOk?: () => void | Promise<void>,
) => {
  showConfirm({
    title: 'Xác nhận xóa',
    content,
    okText: 'Xóa',
    okButtonProps: {
      danger: true,
    },
    onOk,
  });
};

export const showLogoutConfirm = (onOk?: () => void | Promise<void>) => {
  showConfirm({
    title: 'Đăng xuất',
    content: 'Bạn có chắc chắn muốn đăng xuất không?',
    okText: 'Đăng xuất',
    okButtonProps: {
      danger: true,
    },
    onOk,
  });
};
