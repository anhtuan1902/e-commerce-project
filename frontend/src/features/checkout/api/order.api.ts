import api from '@/shared/services/axios.config';
import { ApiResponse } from '@/shared/types/global.types';
import { convertResponse } from '@/shared/utils/convertResponse';
import type { OrderResponse, CreateOrderRequest } from '../types/checkout.types';

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  shipping_status: 'not_shipped' | 'shipped' | 'delivered' | 'returned';
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  discount_amount: string;
  total_amount: string;
  currency: string;
  notes: string | null;
  customer_notes: string | null;
  ordered_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponseWrapper {
  data: Order;
  success: boolean;
  message?: string;
}

/**
 * Tạo đơn hàng mới
 */
export const createOrder = async (data: CreateOrderRequest): Promise<OrderResponseWrapper> => {
  const res = await api.post<ApiResponse<Order>>('/orders', data);
  return convertResponse(res.data);
};

/**
 * Lấy danh sách đơn hàng của user
 */
export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<Order[]> => {
  const res = await api.get<ApiResponse<Order[]>>('/orders', { params });
  return convertResponse(res.data);
};

/**
 * Lấy chi tiết đơn hàng
 */
export const getOrderById = async (id: number): Promise<Order> => {
  const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return convertResponse(res.data);
};

/**
 * Hủy đơn hàng
 */
export const cancelOrder = async (id: number): Promise<Order> => {
  const res = await api.put<ApiResponse<Order>>(`/orders/${id}/cancel`);
  return convertResponse(res.data);
};
