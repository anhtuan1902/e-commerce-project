// shared/utils/jwt.service.ts
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Cookie options
const getCookieOptions = (expiresInDays: number) => ({
    expires: expiresInDays,
    secure: window.location.protocol === "https:",
    sameSite: "Lax" as const,
    path: "/",
});

// Set access token
export const setToken = (token: string) => {
    Cookies.set("accessToken", token, getCookieOptions(7));
};

// Set refresh token
export const setRefreshToken = (refreshToken: string) => {
    Cookies.set("refreshToken", refreshToken, getCookieOptions(30));
};

// Get tokens
export const getToken = () => Cookies.get("accessToken");
export const getRefreshToken = () => Cookies.get("refreshToken");

// Remove tokens
export const removeTokens = () => {
    localStorage.clear()
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
};

// Validate token
export const isTokenValid = (token?: string) => {
    if (!token) return false;

    try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const currentTime = Date.now() / 1000;

        return decoded.exp > currentTime;
    } catch {
        return false;
    }
};

// Decode token
export const getTokenInfo = (token?: string) => {
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
};