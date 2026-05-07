import api from '@/shared/services/axios.config';
import { ApiResponse } from '@/shared/types/global.types';
import { convertResponse } from '@/shared/utils/convertResponse';

export type PaymentMethodType = 'cod' | 'vnpay' | 'momo';

export interface CreatePaymentRequest {
  order_id: number;
  payment_method: PaymentMethodType;
}

export interface CreatePaymentResponse {
  success: boolean;
  data: {
    success: boolean;
    payment: Payment;
    paymentUrl?: string;
    qrCode?: string;
    deeplink?: string;
    transactionId: string;
    message: string;
  };
}

export interface Payment {
  id: number;
  order_id: number;
  payment_method: string;
  payment_gateway: string;
  transaction_id: string | null;
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_date: string | null;
  failure_reason: string | null;
  gateway_response: object | null;
  refunded_amount: string;
  refund_reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodOption {
  code: PaymentMethodType;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

/**
 * Lấy danh sách phương thức thanh toán được hỗ trợ
 */
export const getPaymentMethods = async (): Promise<PaymentMethodOption[]> => {
  const res = await api.get<ApiResponse<PaymentMethodOption[]>>('/payments/methods');
  const converted = convertResponse(res.data);
  return converted.data;
};

/**
 * Tạo thanh toán mới
 */
export const createPayment = async (
  data: CreatePaymentRequest
): Promise<CreatePaymentResponse> => {
  const res = await api.post<ApiResponse<CreatePaymentResponse['data']>>('/payments', data);
  return convertResponse(res.data);
};

/**
 * Lấy chi tiết thanh toán
 */
export const getPaymentById = async (id: number): Promise<Payment> => {
  const res = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
  return convertResponse(res.data);
};

/**
 * Lấy danh sách thanh toán của một đơn hàng
 */
export const getPaymentsByOrder = async (orderId: number): Promise<Payment[]> => {
  const res = await api.get<ApiResponse<Payment[]>>(`/payments/order/${orderId}`);
  return convertResponse(res.data);
};

/**
 * Xác nhận thanh toán COD (khi giao hàng thành công)
 */
export const confirmCODPayment = async (data: {
  order_id: number;
  received_amount?: number;
  notes?: string;
}): Promise<{ success: boolean; message: string }> => {
  const res = await api.post<ApiResponse<{ success: boolean; message: string }>>(
    '/payments/cod/confirm',
    data
  );
  return convertResponse(res.data);
};

/**
 * Từ chối thanh toán COD (khi khách không nhận hàng)
 */
export const rejectCODPayment = async (data: {
  order_id: number;
  reason?: string;
  notes?: string;
}): Promise<{ success: boolean; message: string }> => {
  const res = await api.post<ApiResponse<{ success: boolean; message: string }>>(
    '/payments/cod/reject',
    data
  );
  return convertResponse(res.data);
};
