import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  addAddress as addAddressApi,
  deleteAddress as deleteAddressApi,
  getListAddresses,
  setDefaultAddress as setDefaultAddressApi,
  updateAddress as updateAddressApi,
} from '../api/addresses.api';
import { AddressItem } from '../types/addresses.type';

export const useAddresses = () => {
  const queryClient = useQueryClient();

  const getAddressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: getListAddresses,
  });

  const addAddressMutation = useMutation({
    mutationFn: addAddressApi,
    onSuccess: () => {
      toast.success('Thêm địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Thêm địa chỉ thất bại');
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddressItem }) => updateAddressApi(id, data),
    onSuccess: () => {
      toast.success('Cập nhật địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Cập nhật địa chỉ thất bại');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddressApi,
    onSuccess: () => {
      toast.success('Xóa địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Xóa địa chỉ thất bại');
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: setDefaultAddressApi,
    onSuccess: () => {
      toast.success('Đặt địa chỉ mặc định thành công');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đặt địa chỉ mặc định thất bại');
    },
  });

  const addAddress = useCallback(
    async (data: AddressItem) => addAddressMutation.mutateAsync(data),
    [addAddressMutation],
  );

  const updateAddress = useCallback(
    async (id: number, data: AddressItem) => updateAddressMutation.mutateAsync({ id, data }),
    [updateAddressMutation],
  );

  const deleteAddress = useCallback(
    async (id: number) => deleteAddressMutation.mutateAsync(id),
    [deleteAddressMutation],
  );

  const setDefaultAddress = useCallback(
    async (id: number) => setDefaultAddressMutation.mutateAsync(id),
    [setDefaultAddressMutation],
  );

  return {
    addresses: getAddressesQuery.data?.data ?? [],
    isLoading: getAddressesQuery.isLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isMutating:
      addAddressMutation.isPending ||
      updateAddressMutation.isPending ||
      deleteAddressMutation.isPending ||
      setDefaultAddressMutation.isPending,
  };
};

export default useAddresses;
