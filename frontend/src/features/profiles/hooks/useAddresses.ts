import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  addAddress as addAddressApi,
  deleteAddress as deleteAddressApi,
  getListAddresses,
  setDefaultAddress as setDefaultAddressApi,
  updateAddress as updateAddressApi,
} from '../api/addresses.api';
import { AddressItem } from '../types/addresses.type';

interface MutationError {
  response?: { data?: { message?: string } };
}

const handleMutationError = (error: unknown, fallbackMessage: string) => {
  const err = error as MutationError;
  toast.error(err.response?.data?.message || fallbackMessage);
};

export const useAddresses = () => {
  const queryClient = useQueryClient();

  const queryKey = ['addresses'];

  const getAddressesQuery = useQuery({
    queryKey,
    queryFn: getListAddresses,
  });

  const addAddressMutation = useMutation({
    mutationFn: addAddressApi,
    onSuccess: () => {
      toast.success('Thêm địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => handleMutationError(error, 'Thêm địa chỉ thất bại'),
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddressItem }) => updateAddressApi(id, data),
    onSuccess: () => {
      toast.success('Cập nhật địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => handleMutationError(error, 'Cập nhật địa chỉ thất bại'),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddressApi,
    onSuccess: () => {
      toast.success('Xóa địa chỉ thành công');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => handleMutationError(error, 'Xóa địa chỉ thất bại'),
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: setDefaultAddressApi,
    onSuccess: () => {
      toast.success('Đặt địa chỉ mặc định thành công');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => handleMutationError(error, 'Đặt địa chỉ mặc định thất bại'),
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

  const isMutating = useMemo(
    () =>
      addAddressMutation.isPending ||
      updateAddressMutation.isPending ||
      deleteAddressMutation.isPending ||
      setDefaultAddressMutation.isPending,
    [addAddressMutation.isPending, updateAddressMutation.isPending, deleteAddressMutation.isPending, setDefaultAddressMutation.isPending],
  );

  return {
    addresses: getAddressesQuery.data?.data ?? [],
    isLoading: getAddressesQuery.isLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isMutating,
  };
};

export default useAddresses;
