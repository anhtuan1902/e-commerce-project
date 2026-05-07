import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepState, PaymentMethod, type ShippingAddress } from '@/features/checkout/types/checkout.types';
import { CartStep, CheckoutStep, Stepper, SuccessStep } from '@/features/checkout/components';
import { type PaymentMethodOption } from '@/features/checkout/api/payment.api';
import { type PaymentMethodConfig } from '@/features/checkout/components/PaymentOption';
import useAddresses from '@/features/profiles/hooks/useAddresses';
import { useCheckout } from '@/features/checkout/hooks/useCheckout';
import { getPaymentMethods } from '@/features/checkout/api/payment.api';
import { ROUTES } from '@/shared/constants/routes.constants';
import { useQuery } from '@tanstack/react-query';

const STEP_STORAGE_KEY = 'cart-checkout-step';

export const CartCheckoutPage = () => {
  const navigate = useNavigate();

  // Checkout state từ hook
  const {
    currentStep,
    paymentMethod,
    shippingAddress,
    orderCode,
    cartItems,
    summary,
    isCreatingOrder,
    isCreatingPayment,
    error,
    setStep,
    updateQuantity,
    removeItem,
    clearCart,
    setPaymentMethod,
    setShippingAddress,
    placeOrder,
    reset,
  } = useCheckout();

  // Fetch addresses
  const { addresses } = useAddresses();

  // Fetch enabled payment methods từ API
  const { data: paymentMethodsData, isError } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods,
  });

  // Convert API payment methods sang format component, lọc bỏ methods bị disable
  const enabledPaymentMethods: PaymentMethodConfig[] = (paymentMethodsData || [])
    .filter((method) => method.enabled)
    .map((method) => ({
      id: method.code,
      label: method.name,
      description: method.description,
      enabled: true,
    }));

  // Sync step với sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STEP_STORAGE_KEY, currentStep);
  }, [currentStep]);

  // Set step handler
  const handleStepChange = useCallback(
    (newStep: StepState) => {
      setStep(newStep);
      
      // Auto-select default address when entering checkout
      if (newStep === 'checkout' && addresses.length > 0 && !shippingAddress) {
        const defaultAddr = addresses.find((a) => a.is_default && a.id);
        if (defaultAddr && defaultAddr.id) {
          setShippingAddress({
            id: defaultAddr.id,
            name: defaultAddr.name,
            phone: defaultAddr.phone,
            address: defaultAddr.address_detail,
            isDefault: defaultAddr.is_default,
            type: defaultAddr.type,
          });
        }
      }
    },
    [addresses, shippingAddress, setStep, setShippingAddress],
  );

  // Address change handler
  const handleAddressChange = useCallback(
    (address: ShippingAddress) => {
      setShippingAddress(address);
    },
    [setShippingAddress],
  );

  // Back to cart
  const handleBackToCart = useCallback(() => {
    setStep('cart');
  }, [setStep]);

  // Place order - gọi API
  const handleConfirmOrder = useCallback(async () => {
    const result = await placeOrder();
    
    if (!result.success) {
      // Error đã được set trong hook
      console.error('Order failed:', error);
    }
  }, [placeOrder, error]);

  // Continue shopping
  const handleContinueShopping = useCallback(() => {
    reset();
    navigate(ROUTES.HOME);
  }, [reset, navigate]);

  // Render step content
  const renderStep = (step: StepState) => {
    const isLoading = isCreatingOrder || isCreatingPayment;

    switch (step) {
      case 'cart':
        return (
          <CartStep
            cartItems={cartItems}
            subtotal={summary.subtotal}
            totalItems={summary.totalItems}
            totalPrice={summary.totalPrice}
            shippingFee={summary.shippingFee}
            onUpdateQuantity={(id, delta) => updateQuantity(Number(id), delta)}
            onRemoveItem={(id) => removeItem(Number(id))}
            onClearCart={clearCart}
            onCheckout={() => handleStepChange('checkout')}
          />
        );

      case 'checkout':
        return (
          <CheckoutStep
            cartItems={cartItems}
            totalItems={summary.totalItems}
            totalPrice={summary.subtotal}
            shippingFee={summary.shippingFee}
            discount={summary.discount}
            shippingAddresses={addresses}
            selectedAddress={shippingAddress}
            paymentMethod={paymentMethod}
            enabledPaymentMethods={enabledPaymentMethods}
            isLoading={isLoading}
            error={error}
            onBack={handleBackToCart}
            onAddressChange={handleAddressChange}
            onNavigateToAddresses={() => navigate(ROUTES.PROFILE)}
            onPaymentMethodChange={setPaymentMethod}
            onConfirmOrder={handleConfirmOrder}
          />
        );

      case 'success':
        return (
          <SuccessStep
            orderCode={orderCode || 'N/A'}
            onContinueShopping={handleContinueShopping}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 min-h-auto bg-slate-50">
      <Stepper currentStep={currentStep} />
      {renderStep(currentStep)}
    </div>
  );
};

export { STEP_STORAGE_KEY };
