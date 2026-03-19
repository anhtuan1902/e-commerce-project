import { jwtDecode } from "jwt-decode";

class JwtService {
    // Get cookie options with security attributes
    getCookieOptions(expiresInDays: number) {
        return {
            expires: expiresInDays,
            secure: window.location.protocol === 'https:', // Only send over HTTPS in production
            sameSite: 'Lax', // CSRF protection while allowing normal navigation
            path: '/', // Available throughout the app
        };
    }

    // Save token to cookie with expiry matching JWT
    setToken(token: string) {
        cookieStore.set("token", token);
    }

    // Save refresh token to cookie
    setRefreshToken(refreshToken: string) {
        cookieStore.set("refreshToken", refreshToken);
    }

    // Get token from cookie
    getToken() {
        return cookieStore.get("token");
    }

    // Get refresh token from cookie
    getRefreshToken() {
        return cookieStore.get("refreshToken");
    }

    // Remove token and refresh token
    removeTokens() {
        cookieStore.delete("token");
        cookieStore.delete("refreshToken");
    }

    // Check if token is valid
    isTokenValid(token: string) {
        if (!token) return false;

        try {
            const decoded = jwtDecode(token) as { exp: number };
            const currentTime = Date.now() / 1000;

            return decoded.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    // Get token info
    getTokenInfo(token: string) {
        try {
            return jwtDecode(token);
        } catch (error) {
            return null;
        }
    }
}

export const jwtService = new JwtService();
