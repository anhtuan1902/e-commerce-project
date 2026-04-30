export type StepState = 'cart' | 'checkout' | 'success';

export type PaymentMethod = 'cod' | 'momo' | 'card';

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

export interface CheckoutState {
  currentStep: StepState;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  orderCode?: string;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
}
