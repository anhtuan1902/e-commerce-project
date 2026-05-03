import { AddressItem } from '@/features/profiles/types/addresses.type';
import convertAddress from '@/shared/utils/convertAddess';
import { AddressSelectModal } from './AddressSelectModal';
import { OrderSummary } from './OrderSummary';
import { PaymentOption, PAYMENT_METHODS } from './PaymentOption';
import { CreditCard, MapPin } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes.constants';
import type { CartItem } from '@/store/cart.store';
import type { PaymentMethod } from '../types/checkout.types';

interface CheckoutStepProps {
  discount: number;
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  shippingAddresses: AddressItem[];
  selectedAddressId?: number;
  onBack: () => void;
  onAddressChange?: (address: AddressItem) => void;
  onNavigateToAddresses?: () => void;
  onConfirmOrder: () => void;
}

export const CheckoutStep = memo(function CheckoutStep({
  cartItems,
  totalItems,
  totalPrice,
  discount,
  shippingAddresses,
  selectedAddressId,
  onBack,
  onAddressChange,
  onNavigateToAddresses,
  onConfirmOrder,
}: CheckoutStepProps) {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cod');
  const navigate = useNavigate();

  const currentSelectedId = useMemo(
    () => selectedAddressId ?? shippingAddresses.find((a) => a.is_default)?.id,
    [selectedAddressId, shippingAddresses],
  );

  const shippingAddress = useMemo(
    () => shippingAddresses.find((address) => address.id === currentSelectedId) || shippingAddresses[0],
    [shippingAddresses, currentSelectedId],
  );

  const handleOpenAddressModal = useCallback(() => setIsAddressModalOpen(true), []);
  const handleCloseAddressModal = useCallback(() => setIsAddressModalOpen(false), []);
  const handleSelectAddress = useCallback(
    (address: AddressItem) => onAddressChange?.(address),
    [onAddressChange],
  );
  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => setSelectedPaymentMethod(method), []);
  const handleConfirmOrder = useCallback(() => {
    console.log('Confirm order:', { shippingAddress, paymentMethod: selectedPaymentMethod });
    onConfirmOrder();
  }, [shippingAddress, selectedPaymentMethod, onConfirmOrder]);
  const handleNavigateToAddAddress = useCallback(() => {
    handleCloseAddressModal();
    onNavigateToAddresses?.() ?? navigate(ROUTES.PROFILE);
  }, [handleCloseAddressModal, onNavigateToAddresses, navigate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Địa chỉ nhận hàng
            </div>
            <button onClick={handleOpenAddressModal} className="text-xs text-indigo-600 font-bold hover:text-indigo-700">
              Thay đổi
            </button>
          </div>
          <div className="p-6">
            {shippingAddress ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-black text-slate-900">{shippingAddress.name}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="font-bold text-slate-600">{shippingAddress.phone}</span>
                  {shippingAddress.is_default && (
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      Mặc định
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${shippingAddress.type === 'home' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {shippingAddress.type === 'home' ? '🏠 Nhà' : '🏢 Công ty'}
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {convertAddress(shippingAddress.address_detail, shippingAddress.ward, shippingAddress.city)}
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 mb-3">Chưa có địa chỉ giao hàng</p>
                <button onClick={handleNavigateToAddAddress} className="text-indigo-600 font-bold text-sm hover:underline">
                  + Thêm địa chỉ mới
                </button>
              </div>
            )}
          </div>
        </section>

        <AddressSelectModal
          isOpen={isAddressModalOpen}
          addresses={shippingAddresses}
          selectedAddressId={currentSelectedId}
          onSelect={handleSelectAddress}
          onClose={handleCloseAddressModal}
        />

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 font-bold">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            Phương thức thanh toán
          </div>
          <div className="p-6 space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <PaymentOption
                key={method.id}
                id={method.id}
                label={method.label}
                description={method.description}
                isSelected={selectedPaymentMethod === method.id}
                onSelect={handlePaymentMethodChange}
              />
            ))}
          </div>
        </section>
      </div>

      <OrderSummary
        items={cartItems}
        totalItems={totalItems}
        totalPrice={totalPrice}
        discount={discount}
        onBack={onBack}
        onConfirmOrder={handleConfirmOrder}
      />
    </div>
  );
});
