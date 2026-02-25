import type {
    AccountInfo,
    IPublicClientApplication
} from "@azure/msal-browser";

/* 🔐 KEYS */
const ACCESS_TOKEN_KEY = "access_token";
const USERNAME_KEY = "username";

/* 🧠 SCOPE DESDE ENV */
const API_SCOPE = import.meta.env.VITE_API_SCOPE;

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

/* 👤 EXTRAER USUARIO ÚNICO DESDE EMAIL */
const getUserFromEmail = (email: string): string => {
    return email.split("@")[0];
};

/* 🧩 OBTENER USUARIO CORPORATIVO DESDE CUENTA */
const getUserFromAccount = (account: AccountInfo): string => {
    const email =
        (account.idTokenClaims as any)?.preferred_username ||
        account.username;

    return getUserFromEmail(email);
};

/* 🆕 ENTRA ID – OBTENER TOKEN */
export const acquireAccessToken = async (
    instance: IPublicClientApplication,
    account: AccountInfo
): Promise<string | null> => {
    try {
        const response = await instance.acquireTokenSilent({
            scopes: [API_SCOPE],
            account,
        });

        const user = getUserFromAccount(account);
        saveSession(response.accessToken, user);

        return response.accessToken;

    } catch (error) {
        console.warn("Token silencioso falló, intentando popup", error);

        const response = await instance.acquireTokenPopup({
            scopes: [API_SCOPE],
            account,
        });

        const user = getUserFromAccount(account);
        saveSession(response.accessToken, user);

        return response.accessToken;
    }
};