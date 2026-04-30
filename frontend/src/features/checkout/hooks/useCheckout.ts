import { useMemo, useCallback, useState } from 'react';
import type {
  PaymentMethod,
  ShippingAddress,
  CartSummary,
  StepState,
} from '../types/checkout.types';
import {
  DEFAULT_SHIPPING_ADDRESS,
  SHIPPING_FEE,
  DEFAULT_DISCOUNT,
} from '../constants/checkout.constants';
import { useCartStore } from '@/store/cart.store';

interface UseCheckoutReturn {
  state: {
    currentStep: StepState;
    paymentMethod: PaymentMethod;
    shippingAddress: ShippingAddress;
    orderCode?: string;
  };
  cartItems: ReturnType<typeof useCartStore>['items'];
  summary: CartSummary;
  setStep: (step: StepState) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  updateShippingAddress: (address: Partial<ShippingAddress>) => void;
  placeOrder: () => void;
}

export function useCheckout(): UseCheckoutReturn {
  const items = useCartStore((state) => state.items);
  const storeUpdateQuantity = useCartStore((state) => state.updateQuantity);
  const storeRemoveItem = useCartStore((state) => state.removeItem);
  const storeClearCart = useCartStore((state) => state.clearCart);

  const [currentStep, setCurrentStep] = useState<StepState>('cart');
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod>('cod');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    DEFAULT_SHIPPING_ADDRESS
  );
  const [orderCode, setOrderCode] = useState<string | undefined>(undefined);

  const summary = useMemo<CartSummary>(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingFee = items.length > 0 ? SHIPPING_FEE : 0;
    const discount = Math.min(DEFAULT_DISCOUNT, subtotal);
    const total = subtotal + shippingFee - discount;

    return { subtotal, shippingFee, discount, total };
  }, [items]);

  const setStep = useCallback((step: StepState) => {
    setCurrentStep(step);
  }, []);

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        const newQuantity = Math.max(1, item.quantity + delta);
        storeUpdateQuantity(id, newQuantity);
      }
    },
    [items, storeUpdateQuantity]
  );

  const removeItem = useCallback(
    (id: string) => {
      storeRemoveItem(id);
    },
    [storeRemoveItem]
  );

  const clearCart = useCallback(() => {
    storeClearCart();
  }, [storeClearCart]);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethodState(method);
  }, []);

  const updateShippingAddress = useCallback(
    (address: Partial<ShippingAddress>) => {
      setShippingAddress((prev) => ({ ...prev, ...address }));
    },
    []
  );

  const placeOrder = useCallback(() => {
    const newOrderCode = `TS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setOrderCode(newOrderCode);
    setCurrentStep('success');
  }, []);

  return {
    state: {
      currentStep,
      paymentMethod,
      shippingAddress,
      orderCode,
    },
    cartItems: items,
    summary,
    setStep,
    updateQuantity,
    removeItem,
    clearCart,
    setPaymentMethod,
    updateShippingAddress,
    placeOrder,
  };
}
