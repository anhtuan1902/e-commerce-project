import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox, Modal, Radio } from 'antd';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import z from 'zod';

import CustomInput from '@/shared/common/CustomInput';
import CustomSelectAddress, { AddressValue } from '@/shared/common/CustomSelectAddress';
import { showDeleteConfirm } from '@/shared/common/ConfirmModal';
import { useAddresses } from '../hooks/useAddresses';

const AddressSchema = z.object({
  name: z.string().min(1, 'Họ và tên không được để trống'),
  phone: z.string().min(1, 'Số điện thoại không được để trống'),
  address_detail: z.string().min(1, 'Địa chỉ chi tiết không được để trống'),
  address: z.object({
    province: z.object({
      value: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
      label: z.string(),
      id: z.string(),
    }),
    ward: z.object({
      value: z.string().min(1, 'Vui lòng chọn phường/xã'),
      label: z.string(),
      id: z.string(),
    }),
  }),
  type: z.enum(['home', 'work']),
  is_default: z.boolean(),
});

export type AddressFormValues = z.infer<typeof AddressSchema>;

interface AddressItem {
  id?: number;
  name: string;
  phone: string;
  address_detail: string;
  city: string;
  ward: string;
  is_default: boolean;
  type: 'home' | 'work';
}

const DEFAULT_FORM_VALUES: Omit<AddressFormValues, 'id'> = {
  name: '',
  phone: '',
  address_detail: '',
  address: {
    province: { value: '', label: '', id: '' },
    ward: { value: '', label: '', id: '' },
  },
  type: 'home',
  is_default: false,
};

interface AddressFormModalProps {
  isOpen: boolean;
  editingId: number | null;
  editingAddress?: AddressItem | null;
  onSubmit: (values: AddressFormValues, editingId: number | null) => Promise<void>;
  onClose: () => void;
}

const AddressFormModal = React.memo<AddressFormModalProps>(
  ({ isOpen, editingId, editingAddress, onSubmit, onClose }) => {
    const methods = useForm<AddressFormValues>({
      defaultValues: DEFAULT_FORM_VALUES,
      resolver: zodResolver(AddressSchema),
    });

    const { handleSubmit, reset } = methods;

    const selectedProvince = methods.watch('address')?.province?.value;
    const selectedWard = methods.watch('address')?.ward?.value;

    useEffect(() => {
      if (isOpen) {
        if (editingId && editingAddress) {
          reset({
            name: editingAddress.name,
            phone: editingAddress.phone,
            address_detail: editingAddress.address_detail,
            address: {
              province: { value: editingAddress.city, label: editingAddress.city, id: '' },
              ward: { value: editingAddress.ward, label: editingAddress.ward, id: '' },
            },
            type: editingAddress.type,
            is_default: editingAddress.is_default,
          });
        } else {
          reset(DEFAULT_FORM_VALUES);
        }
      }
    }, [isOpen, editingId, editingAddress, reset]);

    return (
      <Modal open={isOpen} onCancel={onClose} footer={null} width={520} centered destroyOnHidden>
        <FormProvider {...methods}>
          <form
            id='address-form'
            className='space-y-4'
            onSubmit={handleSubmit((values) => onSubmit(values, editingId))}
          >
            <h2 className='text-xl font-bold text-gray-900'>
              {editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h2>

            <CustomInput label='Họ và tên' name='name' type='text' placeholder='Nhập họ và tên' />
            <CustomInput
              label='Số điện thoại'
              name='phone'
              type='tel'
              placeholder='Nhập số điện thoại'
            />

            <Controller
              name='address'
              control={methods.control}
              render={({ field }) => (
                <CustomSelectAddress
                  value={field.value as AddressValue}
                  onChange={field.onChange}
                />
              )}
            />

            <CustomInput
              label='Địa chỉ chi tiết'
              name='address_detail'
              type='text'
              placeholder='Nhập địa chỉ (số nhà, đường...)'
              disabled={!(selectedProvince && selectedWard)}
            />

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Loại địa chỉ</label>
              <Controller
                name='type'
                control={methods.control}
                render={({ field }) => (
                  <Radio.Group onChange={field.onChange} value={field.value} className='flex gap-4'>
                    <Radio.Button value='home' className='flex-1 text-center'>
                      🏠 Nhà
                    </Radio.Button>
                    <Radio.Button value='work' className='flex-1 text-center'>
                      🏢 Công ty
                    </Radio.Button>
                  </Radio.Group>
                )}
              />
            </div>

            <Controller
              name='is_default'
              control={methods.control}
              render={({ field }) => (
                <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)}>
                  Đặt làm địa chỉ mặc định
                </Checkbox>
              )}
            />

            <div className='flex justify-center gap-3 pt-4'>
              <button
                type='submit'
                className='px-8 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium'
              >
                Lưu
              </button>
              <button
                type='button'
                onClick={onClose}
                className='px-8 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium'
              >
                Hủy
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    );
  },
);

AddressFormModal.displayName = 'AddressFormModal';

interface AddressCardProps {
  address: AddressItem;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  isDeleting: boolean;
}

const AddressCard = React.memo<AddressCardProps>(
  ({ address, onEdit, onDelete, onSetDefault, isDeleting }) => {
    const fullAddress = useMemo(
      () => `${address.address_detail}, ${address.ward}, ${address.city}`,
      [address.address_detail, address.ward, address.city],
    );

    const typeStyle =
      address.type === 'home' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
    const cardStyle = 'border-gray-200';
    const addressId = address.id as number;

    return (
      <div
        className={`bg-gray-50 rounded-xl p-4 border transition-all hover:shadow-md ${cardStyle}`}
      >
        <div className='flex justify-between items-start'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <span className='font-semibold text-gray-900'>{address.name}</span>
              <span className='text-gray-400'>|</span>
              <span className='text-sm text-gray-600'>{address.phone}</span>
              {address.is_default && (
                <span className='inline-block bg-[#1E3A8A] text-white text-xs px-2 py-1 rounded'>
                  Mặc định
                </span>
              )}
            </div>
            <p className='text-sm text-gray-500 mb-2'>{fullAddress}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeStyle}`}>
              {address.type === 'home' ? '🏠 Nhà' : '🏢 Công ty'}
            </span>
          </div>
        </div>

        <div className='flex gap-4 mt-4 pt-3 border-t border-gray-200'>
          <button
            onClick={() => onEdit(addressId)}
            className='flex items-center gap-1 text-sm text-[#1E3A8A] hover:underline'
            disabled={isDeleting}
          >
            <Pencil className='h-4 w-4' />
            Sửa
          </button>
          {!address.is_default && (
            <>
              <button
                onClick={() => onSetDefault(addressId)}
                className='flex items-center gap-1 text-sm text-gray-500 hover:text-[#1E3A8A] hover:underline'
                disabled={isDeleting}
              >
                Đặt mặc định
              </button>
              <button
                onClick={() => onDelete(addressId)}
                className='flex items-center gap-1 text-sm text-red-500 hover:underline disabled:opacity-50'
                disabled={isDeleting}
              >
                <Trash2 className='h-4 w-4' />
                Xóa
              </button>
            </>
          )}
        </div>
      </div>
    );
  },
);

AddressCard.displayName = 'AddressCard';

const Address = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    addresses,
    isLoading: isFetching,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isMutating,
  } = useAddresses();

  const editingAddress = useMemo(
    () => (editingId ? addresses.find((a) => a.id === editingId) : null),
    [editingId, addresses],
  );

  const handleOpenModal = useCallback((id?: number) => {
    setEditingId(id ?? null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: AddressFormValues, currentEditingId: number | null) => {
      const submitData = {
        name: values.name,
        phone: values.phone,
        address_detail: values.address_detail,
        city: values.address.province.label,
        ward: values.address.ward.label,
        type: values.type,
        is_default: values.is_default,
      };

      if (currentEditingId) {
        await updateAddress(currentEditingId, { ...submitData, id: currentEditingId });
      } else {
        await addAddress({ ...submitData });
      }
      handleCloseModal();
    },
    [addAddress, updateAddress, handleCloseModal],
  );

  const handleDelete = useCallback(
    (id: number) => {
      showDeleteConfirm('Bạn có chắc chắn muốn xóa địa chỉ này?', async () => {
        await deleteAddress(id);
      });
    },
    [deleteAddress],
  );

  const handleSetDefault = useCallback(
    async (id: number) => {
      await setDefaultAddress(id);
    },
    [setDefaultAddress],
  );

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Sổ địa chỉ</h2>
          <p className='text-gray-500'>Quản lý địa chỉ giao hàng của bạn</p>
        </div>
        <button
          type='button'
          onClick={() => handleOpenModal()}
          className='bg-[#1E3A8A] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#152d6b] transition-colors flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          Thêm địa chỉ mới
        </button>
      </div>

      {isFetching ? (
        <div className='text-center py-16'>
          <p className='text-gray-500'>Đang tải...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className='text-center py-16'>
          <MapPin className='h-16 w-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có địa chỉ nào</h3>
          <p className='text-gray-500 mb-6'>
            Thêm địa chỉ giao hàng để tiết kiệm thời gian khi đặt hàng
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {addresses.map((addr: AddressItem) => (
            <AddressCard
              key={addr.id ?? Math.random().toString(36).substring(2, 15)}
              address={addr}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              isDeleting={isMutating}
            />
          ))}
        </div>
      )}

      <AddressFormModal
        isOpen={isModalOpen}
        editingId={editingId}
        editingAddress={editingAddress}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Address;
