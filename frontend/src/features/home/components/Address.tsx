import CustomInput from '@/components/common/CustomInput';
import CustomSelectAddress, { AddressValue } from '@/components/common/CustomSelectAddress';
import { AddressSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox, Modal, Radio } from 'antd';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import useProfiles from '../hooks/useProfiles';
import { es } from 'zod/v4/locales';

interface AddressProps {
  id?: number | null;
  name: string;
  phone: string;
  address_detail: string;
  city: string;
  ward: string;
  is_default: boolean;
  type: 'home' | 'work';
}

const ModalAddAddress = ({
  initialValues,
  isOpen,
  handleOk,
  onClose,
}: {
  initialValues?: AddressProps;
  isOpen: boolean;
  handleOk: (values: any) => void;
  onClose: () => void;
}) => {
  const methods = useForm({
    defaultValues: {
      id: initialValues?.id || null,
      name: initialValues?.name,
      phone: initialValues?.phone,
      address_detail: initialValues?.address_detail,
      address: {
        province: {
          value: initialValues?.city,
          label: initialValues?.city,
          id: '',
        },
        ward: {
          value: initialValues?.ward,
          label: initialValues?.ward,
          id: '',
        },
      },
      type: initialValues?.type || 'home',
      is_default: initialValues?.is_default || false,
    },
    resolver: zodResolver(AddressSchema),
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = methods;

  useEffect(() => {
    if (isOpen) {
      methods.reset({
        id: initialValues?.id || null,
        name: initialValues?.name || '',
        phone: initialValues?.phone || '',
        address_detail: initialValues?.address_detail || '',
        address: {
          province: {
            value: initialValues?.city || '',
            label: initialValues?.city || '',
            id: '',
          },
          ward: {
            value: initialValues?.ward || '',
            label: initialValues?.ward || '',
            id: '',
          },
        },
        type: initialValues?.type || 'home',
        is_default: initialValues?.is_default || false,
      });
    }
  }, [isOpen]);

  return (
    <>
      <FormProvider {...methods}>
        <Modal
          open={isOpen}
          onCancel={onClose}
          footer={() => (
            <div className='flex justify-center space-x-2'>
              <button
                type='submit'
                form='address-form' // 🔥 connect tới form
                className='px-8 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#1E3A8A]/90 transition-colors'
              >
                Lưu
              </button>
              <button
                onClick={onClose}
                type='button'
                className='px-8 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors'
              >
                Hủy
              </button>
            </div>
          )}
        >
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Thêm địa chỉ mới</h2>

          <form
            id='address-form' // 🔥 id để connect
            className='space-y-4'
            onSubmit={handleSubmit(handleOk)}
          >
            <CustomInput
              label='Họ và tên'
              name='name'
              type='text'
              placeholder='Nhập họ và tên'
              error={errors.name}
            />

            <CustomInput
              label='Số điện thoại'
              name='phone'
              type='tel'
              placeholder='Nhập số điện thoại'
              error={errors.phone}
            />

            <Controller
              name='address'
              control={control}
              render={({ field }) => (
                <CustomSelectAddress
                  value={field.value as AddressValue}
                  onChange={field.onChange}
                  error={errors.address as any}
                />
              )}
            />

            <CustomInput
              label='Địa chỉ'
              name='address_detail'
              type='text'
              placeholder='Nhập địa chỉ'
              error={errors.address_detail}
              disabled={!(methods.watch('address')?.province && methods.watch('address')?.ward)}
            />

            <Controller
              name='type'
              control={control}
              render={({ field }) => (
                <div>
                  <Radio.Group onChange={field.onChange} value={field.value}>
                    <Radio.Button value='home'>Địa chỉ nhà</Radio.Button>
                    <Radio.Button value='work'>Địa chỉ công ty</Radio.Button>
                  </Radio.Group>
                </div>
              )}
            />

            <Controller
              name='is_default'
              control={control}
              render={({ field }) => (
                <div>
                  <Checkbox checked={field.value} onChange={field.onChange}>
                    Đặt làm địa chỉ mặc định
                  </Checkbox>
                </div>
              )}
            />
          </form>
        </Modal>
      </FormProvider>
    </>
  );
};

const Address = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoAddress, setInfoAddress] = useState<AddressProps>({
    id: null,
    name: '',
    phone: '',
    address_detail: '',
    city: '',
    ward: '',
    type: 'home' as 'home' | 'work',
    is_default: false,
  });
  const [addressList, setAddressList] = useState<AddressProps[]>([]);

  const { getListAddress, addAddress, deleteAddress, updateAddress } = useProfiles();

  useEffect(() => {
    (async () => {
      const result = await getListAddress();
      setAddressList(result as AddressProps[]);
      console.log(result);
    })();
  }, []);

  const showModalEdit = () => {
    setIsModalOpen(true);
  };

  const showModalAdd = () => {
    setInfoAddress({
      id: null,
      name: '',
      phone: '',
      address_detail: '',
      city: '',
      ward: '',
      type: 'home' as 'home' | 'work',
      is_default: false,
    });
    setIsModalOpen(true);
  };

  const handleOk = async (values: any) => {
    if (values?.id) {
      const { success, result } = await updateAddress(values.id, values);
      if (success) {
        setIsModalOpen(false);
        setAddressList((prev) =>
          prev.map((addr) => (addr.id === values.id ? { ...addr, ...result } : addr)),
        );
      }
      return;
    }
    const { success, result } = await addAddress(values);
    if (success) {
      if (result?.is_default) {
        setAddressList((prev) => prev.map((addr) => ({ ...addr, is_default: false })));
      }
      setAddressList((prev) => (result.is_default ? [result, ...prev] : [...prev, result]));
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDeleteAddress = async (id: number) => {
    const { success } = await deleteAddress(id);
    if (success) {
      setAddressList((prev) => prev.filter((addr) => addr.id !== id));
    }
  };

  const handleConvertFullAddress = (addr: AddressProps) => {
    return `${addr.address_detail}, ${addr.ward}, ${addr.city}`;
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-6 border-b pb-4'>
        <h2 className='text-2xl font-bold text-gray-900'>Quản lý Địa chỉ</h2>
        <button
          className='text-[#1E3A8A] font-medium flex items-center text-sm'
          onClick={showModalAdd}
        >
          <Plus className='h-4 w-4 mr-1' /> Thêm địa chỉ mới
        </button>
      </div>
      <div className='space-y-4'>
        {addressList.map((addr) => (
          <div
            key={addr.id}
            className='border border-gray-200 rounded-xl p-4 flex justify-between items-start'
          >
            <div>
              <div className='flex items-center mb-1'>
                <span className='font-bold text-gray-900 mr-2'>{addr.name}</span>
                <span className='text-gray-500 text-sm'>| {addr.phone}</span>
                {addr.is_default && (
                  <span className='ml-3 px-2 py-0.5 bg-indigo-50 text-[#1E3A8A] text-xs rounded border border-indigo-200'>
                    Mặc định
                  </span>
                )}
                <span
                  className={`ml-3 px-2 py-0.5 bg-${addr.type === 'home' ? 'green-400' : 'blue-400'} text-[#1E3A8A] text-xs rounded border border-indigo-200`}
                >
                  {addr.type === 'home' ? 'Nhà' : 'Công ty'}
                </span>
              </div>
              <p className='text-gray-600 text-sm'>{handleConvertFullAddress(addr)}</p>
            </div>
            <div className='flex space-x-2 text-sm'>
              <button
                className='text-[#1E3A8A] hover:underline'
                onClick={() => {
                  setInfoAddress({
                    id: addr.id,
                    name: addr.name,
                    phone: addr.phone || '',
                    address_detail: addr.address_detail,
                    city: addr.city,
                    ward: addr.ward,
                    type: addr.type,
                    is_default: addr.is_default,
                  });
                  showModalEdit();
                }}
              >
                Sửa
              </button>
              {!addr.is_default && (
                <button
                  className='text-red-500 hover:underline'
                  onClick={() => handleDeleteAddress(addr.id as number)}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <ModalAddAddress
        initialValues={infoAddress}
        isOpen={isModalOpen}
        handleOk={handleOk}
        onClose={handleCancel}
      />
    </div>
  );
};

export default Address;
