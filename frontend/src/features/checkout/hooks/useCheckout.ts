import { useMemo, useCallback, useState } from 'react';
import type {
  PaymentMethod,
  ShippingAddress,
  CartSummary,
  StepState,
  OrderResponse,
} from '../types/checkout.types';
import { useCartStore, CartItem } from '@/store/cart.store';
import { createOrder } from '../api/order.api';
import { createPayment } from '../api/payment.api';

interface UseCheckoutReturn {
  // State
  currentStep: StepState;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress | null;
  orderId: number | null;
  orderCode: string | null;

  // Cart
  cartItems: CartItem[];
  summary: CartSummary;

  // Loading states
  isCreatingOrder: boolean;
  isCreatingPayment: boolean;
  error: string | null;

  // Actions
  setStep: (step: StepState) => void;
  updateQuantity: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setShippingAddress: (address: ShippingAddress | null) => void;
  placeOrder: () => Promise<{
    success: boolean;
    paymentUrl?: string;
    order?: OrderResponse;
  }>;
  reset: () => void;
}

const SHIPPING_FEE = 30000; // 30,000 VND
const DEFAULT_DISCOUNT = 0;

export function useCheckout(): UseCheckoutReturn {
  const items = useCartStore((state) => state.items);
  const storeUpdateQuantity = useCartStore((state) => state.updateQuantity);
  const storeRemoveItem = useCartStore((state) => state.removeItem);
  const storeClearCart = useCartStore((state) => state.clearCart);

  const [currentStep, setCurrentStep] = useState<StepState>('cart');
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod>('cod');
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate cart summary
  const summary = useMemo<CartSummary>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = items.length > 0 ? SHIPPING_FEE : 0;
    const discount = Math.min(DEFAULT_DISCOUNT, subtotal);
    const total = subtotal + shippingFee - discount;

    return {
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: total,
      subtotal,
      shippingFee,
      discount,
    };
  }, [items]);

  // Set step
  const setStep = useCallback((step: StepState) => {
    setCurrentStep(step);
    setError(null);
  }, []);

  // Update quantity
  const updateQuantity = useCallback(
    (id: number, delta: number) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        storeUpdateQuantity(id, delta);
      }
    },
    [items, storeUpdateQuantity]
  );

  // Remove item
  const removeItem = useCallback(
    (id: number) => {
      storeRemoveItem(id);
    },
    [storeRemoveItem]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    storeClearCart();
  }, [storeClearCart]);

  // Set payment method
  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethodState(method);
  }, []);

  // Set shipping address
  const setShippingAddress = useCallback((address: ShippingAddress | null) => {
    setShippingAddressState(address);
  }, []);

  // Place order
  const placeOrder = useCallback(async () => {
    // Validate
    if (items.length === 0) {
      setError('Giỏ hàng trống');
      return { success: false };
    }

    if (!shippingAddress?.id) {
      setError('Vui lòng chọn địa chỉ giao hàng');
      return { success: false };
    }

    setError(null);
    setIsCreatingOrder(true);

    try {
      // 1. Create order
      const orderData = {
        shipping_address_id: shippingAddress.id,
        order_items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      console.log('[Checkout] Creating order with data:', orderData);
      
      const orderResponse = await createOrder(orderData);
      console.log('[Checkout] Order response:', orderResponse);
      
      // convertResponse wraps the response, so actual order is at orderResponse.data
      const order = orderResponse?.data;
      if (!order || !order.id) {
        throw new Error('Order creation failed - no order ID returned');
      }
      
      setOrderId(order.id);
      setOrderCode(order.order_number);

      // 2. Create payment
      setIsCreatingPayment(true);

      console.log('[Checkout] Creating payment for order:', order.id, 'method:', paymentMethod);

      const paymentResult = await createPayment({
        order_id: order.id,
        payment_method: paymentMethod,
      });

      console.log('[Checkout] Payment created:', paymentResult);

      setIsCreatingPayment(false);
      setIsCreatingOrder(false);

      // 3. Handle based on payment method
      if (paymentMethod === 'cod') {
        // COD: No redirect needed, just clear cart and show success
        clearCart();
        setCurrentStep('success');
        return { success: true, order };
      } else {
        // VNPay or MoMo: Redirect to payment URL
        if (paymentResult?.data?.paymentUrl) {
          window.location.href = paymentResult.data.paymentUrl;
          return { success: true, paymentUrl: paymentResult.data.paymentUrl, order };
        }

        // If no payment URL (e.g., QR code mode), show success
        clearCart();
        setCurrentStep('success');
        return { success: true, order };
      }
    } catch (err: any) {
      setIsCreatingOrder(false);
      setIsCreatingPayment(false);

      console.error('[Checkout] Order/Payment error:', err);

      const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi';
      setError(errorMessage);

      return { success: false };
    }
  }, [items, shippingAddress, paymentMethod, clearCart]);

  // Reset checkout state
  const reset = useCallback(() => {
    setCurrentStep('cart');
    setPaymentMethodState('cod');
    setShippingAddressState(null);
    setOrderId(null);
    setOrderCode(null);
    setError(null);
    setIsCreatingOrder(false);
    setIsCreatingPayment(false);
  }, []);

  return {
    // State
    currentStep,
    paymentMethod,
    shippingAddress,
    orderId,
    orderCode,

    // Cart
    cartItems: items,
    summary,

    // Loading states
    isCreatingOrder,
    isCreatingPayment,
    error,

    // Actions
    setStep,
    updateQuantity,
    removeItem,
    clearCart,
    setPaymentMethod,
    setShippingAddress,
    placeOrder,
    reset,
  };
}
