export const msalConfig = {
    auth: {
        clientId: "7c9438d5-2fa5-42a4-8b7d-ad165e91c280",
        authority: "https://login.microsoftonline.com/65e3f48a-19c4-473d-b6a6-109fd4cc6377",
        redirectUri: "/",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: ["User.Read"],
};