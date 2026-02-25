import type {
    AccountInfo,
    IPublicClientApplication
} from "@azure/msal-browser";
import { loginRequest } from "./authConfig";

/* 🔐 KEYS */
const ACCESS_TOKEN_KEY = "access_token";
const USERNAME_KEY = "username";

/* 💾 SESIÓN */
export const saveSession = (accessToken: string, username: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(USERNAME_KEY, username);
};

export const clearSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
};

export const getAccessToken = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getUsername = (): string | null => {
    return localStorage.getItem(USERNAME_KEY);
};

/* 🆕 ENTRA ID – OBTENER TOKEN */
export const acquireAccessToken = async (
    instance: IPublicClientApplication,
    account: AccountInfo
): Promise<string | null> => {
    try {
        const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account,
        });

        saveSession(response.accessToken, account.username);
        return response.accessToken;
    } catch (error) {
        console.warn("Token silencioso falló, intentando popup", error);

        const response = await instance.acquireTokenPopup({
            ...loginRequest,
            account,
        });

        saveSession(response.accessToken, account.username);
        return response.accessToken;
    }
};