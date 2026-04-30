import { AddressItem } from '@/features/profiles/types/addresses.type';
import convertAddress from '@/shared/utils/convertAddess';
import { Building2, Check, Home, MapPin } from 'lucide-react';
import { memo, useCallback } from 'react';
import { Modal } from 'antd';

interface AddressSelectModalProps {
  isOpen: boolean;
  addresses: AddressItem[];
  selectedAddressId?: number;
  onSelect: (address: AddressItem) => void;
  onClose: () => void;
}

export const AddressSelectModal = memo<AddressSelectModalProps>(
  ({ isOpen, addresses, selectedAddressId, onSelect, onClose }) => {
    const handleSelect = useCallback(
      (address: AddressItem) => {
        onSelect(address);
        onClose();
      },
      [onSelect, onClose],
    );

    return (
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        title={
          <div className='flex items-center gap-2'>
            <MapPin className='w-5 h-5 text-indigo-600' />
            <span className='font-bold text-lg'>Chọn địa chỉ giao hàng</span>
          </div>
        }
        width={520}
        centered
        destroyOnHidden
      >
        <div className='space-y-3 mt-4 max-h-96 overflow-y-auto pr-2'>
          {addresses.length === 0 ? (
            <div className='text-center py-8'>
              <MapPin className='w-12 h-12 text-slate-300 mx-auto mb-3' />
              <p className='text-slate-500'>Chưa có địa chỉ nào</p>
              <p className='text-slate-400 text-sm'>Vui lòng thêm địa chỉ giao hàng</p>
            </div>
          ) : (
            addresses.map((address) => {
              const isSelected = address.id === selectedAddressId;
              const fullAddress = convertAddress(
                address.address_detail,
                address.ward,
                address.city,
              );

              return (
                <div
                  key={address.id}
                  onClick={() => handleSelect(address)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all items-center ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && (
                    <div className='absolute top-7 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center'>
                      <Check className='w-4 h-4 text-white' />
                    </div>
                  )}
                  <div className='flex items-center gap-3 '>
                    <div
                      className={`p-2 rounded-lg ${
                        address.type === 'home' ? 'bg-green-100' : 'bg-blue-100'
                      }`}
                    >
                      {address.type === 'home' ? (
                        <Home className='w-5 h-5 text-green-600' />
                      ) : (
                        <Building2 className='w-5 h-5 text-blue-600' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-bold text-slate-900'>{address.name}</span>
                        <span className='text-slate-400'>|</span>
                        <span className='text-sm text-slate-600'>{address.phone}</span>
                        {address.is_default && (
                          <span className='bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded font-bold'>
                            Mặc định
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${address.type === 'home' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                        >
                          {address.type === 'home' ? '🏠 Nhà' : '🏢 Công ty'}
                        </span>
                      </div>
                      <p className='text-sm text-slate-500 leading-relaxed'>{fullAddress}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className='mt-4 pt-4 border-t border-slate-100'>
          <button
            onClick={onClose}
            className='w-full py-2.5 text-slate-500 font-medium text-sm hover:text-slate-700'
          >
            Hủy
          </button>
        </div>
      </Modal>
    );
  },
);

AddressSelectModal.displayName = 'AddressSelectModal';
