import { useAppDispatch, useAppSelector } from "@/hooks";
import { LoginRequestSchema } from "@/schemas/auth.schema";
import { loginThunk, logoutThunk } from "@/store/slices/authSlice";
import { LoginRequest } from "@/types/auth.types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

const useLogin = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const authState = useAppSelector((state) => state.auth);
    const [validationError, setValidationError] = useState<string | null>(null);

    const login = async (data: LoginRequest) => {
        const result = LoginRequestSchema.safeParse({
            email: data.email.trim().toLowerCase(),
            password: data.password,
        });

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
            await dispatch(loginThunk(result.data)).unwrap();
            navigate('/');
        } catch (err: any) {
            setValidationError(err || 'Đăng nhập thất bại');
        }
    };

    const loginWithGoogle = async () => {
        AuthService.loginWithGoogle();
    }



    return {
        login,
        loginWithGoogle,
        isLoading: authState.isLoading,
        error: validationError || authState.error,
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
    };
};

export default useLogin;
