import { useAppSelector } from "@/hooks";
import { InfoAccountSchema } from "@/schemas/auth.schema";
import { Profile } from "@/types/profile.type";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProfileService from "../services/profile.service";
import { useSearchParams } from "react-router-dom";
import { convertMessageError } from "@/utils/convertMessageError";

const useProfiles = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get('tab') || 'info';
    const setActiveTab = useCallback(
        (tab: string) => {
            setSearchParams({ tab });
        },
        [setSearchParams],
    );

    const currentUser = useAppSelector((state) => state.auth.user);

    const [selectedAvatar, setSelectedAvatar] = useState<File | string | null>(
        currentUser?.profile?.avatarUrl || null,
    );
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        currentUser?.profile?.avatarUrl || null,
    );
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser?.profile?.avatarUrl) {
            setSelectedAvatar(currentUser.profile.avatarUrl);
            setAvatarPreview(currentUser.profile.avatarUrl);
        }
    }, [currentUser?.profile?.avatarUrl]);

    const updateProfile = useCallback(
        async (profileData: Profile) => {
            const result = InfoAccountSchema.safeParse(profileData);

            if (!result.success) {
                const errors = result.error.flatten().fieldErrors;
                const message = Object.values(errors)
                    .flat()
                    .filter(Boolean)
                    .join(', ');

                setValidationError(message || 'Đăng nhập thất bại');
                return;
            }

            setValidationError(null);

            try {
                const formData = new FormData();
                if (profileData.name !== currentUser?.profile?.name) {
                    formData.append('name', profileData.name);
                }
                if (profileData.phone_number !== currentUser?.profile?.phone && profileData.phone_number) {
                    formData.append('phone', profileData.phone_number);
                }
                if (selectedAvatar && typeof selectedAvatar === 'object') {
                    formData.append('avatar', selectedAvatar);
                }
                if (profileData.birthday !== currentUser?.profile?.birthday && profileData.birthday) {
                    formData.append('birthday', profileData.birthday);
                }
                if (profileData.gender !== currentUser?.profile?.gender && profileData.gender) {
                    formData.append('gender', profileData.gender);
                }
                await ProfileService.update(formData);

                toast.success('Cập nhật thông tin thành công!');

            } catch (err: any) {
                toast.error('Cập nhật thông tin thất bại!');
            }
        },
        [currentUser, selectedAvatar],
    );

    const changePassword = useCallback(async (data: any) => {
        try {
            await ProfileService.changePassword(data);
            toast.success('Đổi mật khẩu thành công!');
        } catch (err: any) {
            toast.error(convertMessageError(err.response.data.message) || 'Đổi mật khẩu thất bại!');
        }
    }, []);

    const getListAddress = useCallback(async () => {
        try {
            const result = await ProfileService.getListAddress();
            return result;
        } catch (err: any) {
            toast.error('Lấy danh sách địa chỉ thất bại!');
            return [];
        }
    }, []);

    const addAddress = useCallback(async (data: any) => {
        try {
            const dataBody = {
                name: data.name,
                phone: data.phone,
                address_detail: data.address_detail,
                city: data.address.province.value,
                ward: data.address.ward.value,
                type: data.type,
                is_default: data.is_default,
            };
            const { result, success, message } = await ProfileService.addAddress(dataBody);
            toast.success('Thêm địa chỉ thành công!');
            return { result, success, message };
        } catch (err: any) {
            toast.error('Thêm địa chỉ thất bại!');
            return { success: false, message: 'Thêm địa chỉ thất bại!' };
        }
    }, []);

    const updateAddress = useCallback(async (id: number, data: any) => {
        try {
            const dataBody = {
                name: data.name,
                phone: data.phone,
                address_detail: data.address_detail,
                city: data.address.province.value,
                ward: data.address.ward.value,
                type: data.type,
                is_default: data.is_default,
            };
            const { result, success, message } = await ProfileService.updateAddress(id, dataBody);
            toast.success('Cập nhật địa chỉ thành công!');
            return { result, success, message };
        }
        catch (err: any) {
            toast.error('Cập nhật địa chỉ thất bại!');
            return { success: false, message: 'Cập nhật địa chỉ thất bại!' };
        }
    }, []);

    const deleteAddress = useCallback(async (id: number) => {
        try {
            const { success } = await ProfileService.deleteAddress(id);
            toast.success('Xóa địa chỉ thành công!');
            return { success };
        } catch (err: any) {
            toast.error('Xóa địa chỉ thất bại!');
            return { success: false };
        }
    }, []);

    const profileHooks = useMemo(
        () => ({
            updateProfile,
            validationError,
            activeTab,
            setActiveTab,
            selectedAvatar,
            setSelectedAvatar,
            avatarPreview,
            setAvatarPreview,
            currentUser,
            changePassword,
            getListAddress,
            addAddress,
            updateAddress,
            deleteAddress,
        }),
        [
            updateProfile,
            validationError,
            activeTab,
            setActiveTab,
            selectedAvatar,
            setSelectedAvatar,
            avatarPreview,
            setAvatarPreview,
            currentUser,
            changePassword,
            getListAddress,
            addAddress,
            updateAddress,
            deleteAddress,
        ],
    );

    return profileHooks;
}

export default useProfiles
