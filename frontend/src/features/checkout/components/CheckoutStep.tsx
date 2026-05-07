import { useAddresses } from '@/features/profiles/hooks/useAddresses';
import { AddressFormModal, type AddressFormValues } from '@/features/profiles/components/Address';
import { AddressItem } from '@/features/profiles/types/addresses.type';
import convertAddress from '@/shared/utils/convertAddess';
import { AddressSelectModal } from './AddressSelectModal';
import { OrderSummary } from './OrderSummary';
import { PaymentOption, type PaymentMethodConfig } from './PaymentOption';
import { VNPayForm, type VNPayCardData } from './VNPayForm';
import { CreditCard, MapPin } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import type { CartItem } from '@/store/cart.store';
import type { PaymentMethod, ShippingAddress } from '../types/checkout.types';

interface CheckoutStepProps {
  discount: number;
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
  shippingFee: number;
  shippingAddresses: AddressItem[];
  selectedAddress?: ShippingAddress | null;
  paymentMethod: PaymentMethod;
  enabledPaymentMethods?: PaymentMethodConfig[];
  isLoading?: boolean;
  error?: string | null;
  onBack: () => void;
  onAddressChange?: (address: ShippingAddress) => void;
  onNavigateToAddresses?: () => void;
  onPaymentMethodChange?: (method: PaymentMethod) => void;
  onConfirmOrder: () => void | Promise<void>;
}

export const CheckoutStep = memo<CheckoutStepProps>(({
  cartItems,
  totalItems,
  totalPrice,
  shippingFee,
  discount,
  shippingAddresses,
  selectedAddress,
  paymentMethod,
  enabledPaymentMethods = [],
  isLoading = false,
  error = null,
  onBack,
  onAddressChange,
  onPaymentMethodChange,
  onConfirmOrder,
}) => {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [showVNPayForm, setShowVNPayForm] = useState(false);
  const { addAddress } = useAddresses();

  // Find default address if none selected
  const currentSelectedId = useMemo(
    () => selectedAddress?.id ?? shippingAddresses.find((a) => a.is_default)?.id,
    [selectedAddress, shippingAddresses],
  );

  // Current shipping address
  const shippingAddress = useMemo(() => {
    if (selectedAddress) {
      return selectedAddress;
    }
    const addr = shippingAddresses.find((address) => address.id === currentSelectedId);
    if (addr) {
      return {
        id: addr.id,
        name: addr.name,
        phone: addr.phone,
        address: convertAddress(addr.address_detail, addr.ward, addr.city),
        address_detail: addr.address_detail,
        ward: addr.ward,
        city: addr.city,
        isDefault: addr.is_default,
        type: addr.type,
      };
    }
    return null;
  }, [selectedAddress, shippingAddresses, currentSelectedId]);

  // Handlers
  const handleOpenAddressModal = useCallback(() => setIsAddressModalOpen(true), []);
  const handleCloseAddressModal = useCallback(() => setIsAddressModalOpen(false), []);

  const handleSelectAddress = useCallback(
    (address: AddressItem) => {
      if (!address.id) return;

      const shippingAddr: ShippingAddress = {
        id: address.id,
        name: address.name,
        phone: address.phone,
        address: convertAddress(address.address_detail, address.ward, address.city),
        address_detail: address.address_detail,
        ward: address.ward,
        city: address.city,
        isDefault: address.is_default,
        type: address.type,
      };

      onAddressChange?.(shippingAddr);
    },
    [onAddressChange],
  );

  const handlePaymentMethodChange = useCallback(
    (method: PaymentMethod) => {
      // Show VNPay form when VNPay is selected
      if (method === 'vnpay') {
        setShowVNPayForm(true);
      } else {
        setShowVNPayForm(false);
      }
      onPaymentMethodChange?.(method);
    },
    [onPaymentMethodChange],
  );

  const handleVNPaySubmit = useCallback(
    (cardData: VNPayCardData) => {
      // Card data is collected, proceed with order
      // The actual payment will be processed in the checkout flow
      setShowVNPayForm(false);
      onConfirmOrder();
    },
    [onConfirmOrder],
  );

  const handleVNPayCancel = useCallback(() => {
    setShowVNPayForm(false);
    // Reset to COD
    onPaymentMethodChange?.('cod');
  }, [onPaymentMethodChange]);

  const handleConfirmOrder = useCallback(() => {
    if (!shippingAddress?.id) {
      setIsAddressModalOpen(true);
      return;
    }
    onConfirmOrder();
  }, [shippingAddress, onConfirmOrder]);

  const handleNavigateToAddAddress = useCallback(() => {
    handleCloseAddressModal();
    setIsAddAddressModalOpen(true);
  }, [handleCloseAddressModal]);

  const handleAddAddressSubmit = useCallback(
    async (values: AddressFormValues) => {
      const submitData = {
        name: values.name,
        phone: values.phone,
        address_detail: values.address_detail,
        city: values.address.province.label,
        ward: values.address.ward.label,
        type: values.type,
        is_default: values.is_default,
      };
      
      try {
        const result = await addAddress({ ...submitData });
        setIsAddAddressModalOpen(false);
        
        // Auto-select the newly created address
        if (result?.data && onAddressChange) {
          const newAddress = result.data;
          onAddressChange({
            id: newAddress.id,
            name: newAddress.name,
            phone: newAddress.phone,
            address: convertAddress(newAddress.address_detail, newAddress.ward, newAddress.city),
            address_detail: newAddress.address_detail,
            ward: newAddress.ward,
            city: newAddress.city,
            isDefault: newAddress.is_default,
            type: newAddress.type,
          });
        }
      } catch (error) {
        // Error is handled by the hook's onError callback
        console.error('Failed to add address:', error);
      }
    },
    [addAddress, onAddressChange],
  );

  // Filter out disabled payment methods
  const availablePaymentMethods = useMemo(() => {
    return enabledPaymentMethods.filter((method) => method.enabled);
  }, [enabledPaymentMethods]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Shipping Address */}
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
                    {shippingAddress.isDefault && (
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        Mặc định
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${shippingAddress.type === 'home' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {shippingAddress.type === 'home' ? '🏠 Nhà' : '🏢 Công ty'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {shippingAddress.address}
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

          <AddressFormModal
            isOpen={isAddAddressModalOpen}
            editingId={null}
            editingAddress={null}
            onSubmit={handleAddAddressSubmit}
            onClose={() => setIsAddAddressModalOpen(false)}
          />

          {/* Payment Methods */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 font-bold">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Phương thức thanh toán
            </div>
            <div className="p-6 space-y-3">
              {availablePaymentMethods.map((method) => (
                <PaymentOption
                  key={method.id}
                  id={method.id}
                  label={method.label}
                  description={method.description}
                  isSelected={paymentMethod === method.id}
                  onSelect={handlePaymentMethodChange}
                />
              ))}
            </div>
            
            {/* VNPay Card Form - shown when VNPay is selected */}
            {paymentMethod === 'vnpay' && showVNPayForm && (
              <div className="px-6 pb-6">
                <VNPayForm
                  amount={totalPrice + shippingFee - discount}
                  onSubmit={handleVNPaySubmit}
                  onCancel={handleVNPayCancel}
                  isLoading={isLoading}
                />
              </div>
            )}
          </section>
        </div>

        <OrderSummary
          items={cartItems}
          totalItems={totalItems}
          totalPrice={totalPrice}
          shippingFee={shippingFee}
          discount={discount}
          isLoading={isLoading}
          onBack={onBack}
          onConfirmOrder={handleConfirmOrder}
        />
      </div>
    </>
  );
});

CheckoutStep.displayName = 'CheckoutStep';
