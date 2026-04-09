import { useAppDispatch, useAppSelector } from "@/hooks";
import { RegisterCustomerRequestSchema, RegisterVendorRequestSchema } from "@/schemas/auth.schema";
import { registerThunk } from "@/store/slices/authSlice";
import { RegisterRequest } from "@/types/auth.types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const useRegister = (accountType: string) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const authState = useAppSelector((state) => state.auth);
    const [validationError, setValidationError] = useState<string | null>(null);

    const registerSubmit = async (data: RegisterRequest) => {
        // Implementation for registration logic
        const result = accountType === 'customer' ? RegisterCustomerRequestSchema.safeParse(data) : RegisterVendorRequestSchema.safeParse(data);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const message = Object.values(errors)
                .flat()
                .filter(Boolean)
                .join(', ');

            setValidationError(message || 'Đăng ký thất bại');
            return;
        }

        setValidationError(null);
        try {
            await dispatch(registerThunk(data)).unwrap();
            navigate('/');
        } catch (err: any) {
            setValidationError(err || 'Đăng ký thất bại');
        }
    };

    return { registerSubmit, isLoading: authState.isLoading, error: validationError || authState.error };
}

export default useRegister
