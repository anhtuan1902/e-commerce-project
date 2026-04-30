import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepState } from '@/features/checkout';
import { CartStep, CheckoutStep, Stepper, SuccessStep } from '@/features/checkout/components';
import { AddressItem } from '@/features/profiles/types/addresses.type';
import useAddresses from '@/features/profiles/hooks/useAddresses';
import { useCartStore } from '@/store/cart.store';
import { ROUTES } from '@/shared/constants/routes.constants';

export const STEP_STORAGE_KEY = 'cart-checkout-step';

export const CartCheckoutPage = () => {
  const [step, setStep] = useState<StepState>(() => {
    const saved = sessionStorage.getItem(STEP_STORAGE_KEY);
    return (saved as StepState) || 'cart';
  });
  const [discount, setDiscount] = useState<number>(0);
  const [orderCode, setOrderCode] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>(undefined);

  const { addresses } = useAddresses();
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const defaultAddressId = addresses.find((a) => a.is_default)?.id;
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem(STEP_STORAGE_KEY, step);
  }, [step]);

  const handleStepChange = useCallback((newStep: StepState) => {
    setStep(newStep);
    if (newStep === 'checkout' && addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(defaultAddressId);
    }
  }, [addresses.length, selectedAddressId, defaultAddressId]);

  const handleAddressChange = useCallback((address: AddressItem) => {
    setSelectedAddressId(address.id);
  }, []);

  const handleBackToCart = useCallback(() => setStep('cart'), []);

  const handleConfirmOrder = useCallback(() => {
    setOrderCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    setStep('success');
  }, []);

  const renderStep = (currentStep: StepState) => {
    if (currentStep === 'cart') {
      return (
        <CartStep
          cartItems={items}
          totalItems={totalItems}
          totalPrice={totalPrice}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
          onCheckout={() => handleStepChange('checkout')}
        />
      );
    }

    if (currentStep === 'checkout') {
      return (
        <CheckoutStep
          cartItems={items}
          totalItems={totalItems}
          totalPrice={totalPrice}
          discount={discount}
          shippingAddresses={addresses}
          selectedAddressId={selectedAddressId}
          onBack={handleBackToCart}
          onAddressChange={handleAddressChange}
          onNavigateToAddresses={() => navigate(ROUTES.PROFILE)}
          onConfirmOrder={handleConfirmOrder}
        />
      );
    }

    if (currentStep === 'success') {
      return (
        <SuccessStep
          orderCode={orderCode}
          onContinueShopping={() => navigate(ROUTES.HOME)}
        />
      );
    }

    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 min-h-auto bg-slate-50">
      <Stepper currentStep={step} />
      {renderStep(step)}
    </div>
  );
};
