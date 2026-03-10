/* CONFIGURACIÓN MSAL */

// Variables de entorno necesarias para autenticación con Microsoft Entra
const CLIENT_ID = import.meta.env.VITE_ENTRA_CLIENT_ID as string; // ID de la aplicación registrada
const TENANT_ID = import.meta.env.VITE_ENTRA_TENANT_ID as string; // ID del tenant
const CIAM_DOMAIN = import.meta.env.VITE_ENTRA_CIAM_DOMAIN as string; // Dominio CIAM de Entra

// Valida que las variables de entorno estén definidas
if (!CLIENT_ID) throw new Error("VITE_ENTRA_CLIENT_ID no está definida");
if (!TENANT_ID) throw new Error("VITE_ENTRA_TENANT_ID no está definida");
if (!CIAM_DOMAIN) throw new Error("VITE_ENTRA_CIAM_DOMAIN no está definida");

// Construye la URL de autoridad para autenticación
const AUTHORITY = `https://${CIAM_DOMAIN}/${TENANT_ID}/`;

// URL de redirección después del login
const REDIRECT_URI =
    (import.meta.env.VITE_REDIRECT_URI as string) || window.location.origin;

// URL de redirección después del logout
const POST_LOGOUT_REDIRECT_URI =
    (import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI as string) ||
    window.location.origin;

// Configuración principal de MSAL
export const msalConfig = {
    auth: {
        clientId: CLIENT_ID, // ID de la aplicación en Entra
        authority: AUTHORITY, // Autoridad de autenticación
        knownAuthorities: [CIAM_DOMAIN], // Dominios permitidos
        redirectUri: REDIRECT_URI, // Redirección después de login
        postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI, // Redirección después de logout
    },
    cache: {
        cacheLocation: "localStorage", // Guarda sesión en almacenamiento local
    },
};

/* Scopes que determinan el ACCESS TOKEN recibido */

// Configuración de permisos solicitados al iniciar sesión
export const loginRequest = {
    scopes: (import.meta.env.VITE_LOGIN_SCOPES || "openid profile").split(" "), // Scopes de autenticación
};