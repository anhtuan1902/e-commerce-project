import api from '@/shared/services/axios.config';
import { ApiResponse } from '@/shared/types/global.types';
import { convertResponse } from '@/shared/utils/convertResponse';
import { AddressItem } from '../types/addresses.type';

export const getListAddresses = async () => {
  const res = await api.get<ApiResponse<AddressItem[]>>('/addresses');
  return convertResponse(res.data);
};

export const addAddress = async (data: AddressItem) => {
  const res = await api.post<ApiResponse<AddressItem>>('/addresses', data);
  return convertResponse(res.data);
};

export const updateAddress = async (id: number, data: AddressItem) => {
  const res = await api.put<ApiResponse<AddressItem>>(`/addresses/${id}`, data);
  return convertResponse(res.data);
};

export const deleteAddress = async (id: number) => {
  const res = await api.delete<ApiResponse<AddressItem>>(`/addresses/${id}`);
  return convertResponse(res.data);
};

export const setDefaultAddress = async (id: number) => {
  const res = await api.put<ApiResponse<AddressItem>>(`/addresses/${id}/set-default`);
  return convertResponse(res.data);
};
