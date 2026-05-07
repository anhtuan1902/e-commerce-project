export type StepState = 'cart' | 'checkout' | 'success';

export type PaymentMethod = 'cod' | 'vnpay' | 'momo';

export interface ShippingAddress {
  id?: number;
  name: string;
  phone: string;
  address: string;
  address_detail?: string;
  ward?: string;
  city?: string;
  isDefault?: boolean;
  type?: 'home' | 'office' | 'work';
}

export interface CheckoutState {
  currentStep: StepState;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  orderCode?: string;
  orderId?: number;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  orderCode?: string;
  orderId?: number;
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
}

export interface CreateOrderRequest {
  shipping_address_id: number;
  billing_address_id?: number;
  order_items: {
    product_id: number;
    quantity: number;
  }[];
  notes?: string;
  customer_notes?: string;
  payment_method?: PaymentMethod; // Optional - payment is handled separately
}

export interface OrderResponse {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: string;
  createdAt: string;
}
