import { useMutation } from "@tanstack/react-query";
import { getGoogleLoginUrl } from "../api/auth.api";

export const useGoogleLogin = () => {
    return useMutation({
        mutationFn: async () => {
            const url = getGoogleLoginUrl();

            // 🔥 redirect
            window.location.href = url;

            return true;
        },
    }); 
};

