// Importa tipos de MSAL para manejo de autenticación
import type { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

/* ====== STORAGE KEYS ====== */
// Claves usadas para guardar datos en localStorage
const ACCESS_TOKEN_KEY = "access_token";
const USERNAME_KEY     = "username";
const ID_TOKEN_KEY     = "id_token";
const NAME_KEY         = "name";
const UNIQUE_NAME_KEY  = "unique_name";

/* ====== HELPERS JWT (decodificar, solo lectura) ====== */

// Decodifica el payload de un JWT sin validarlo
function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split(".")[1]; // Obtiene la parte payload
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Ajusta padding Base64
    const padded =
      base64.length % 4 === 2 ? base64 + "==" :
      base64.length % 4 === 3 ? base64 + "="  : base64;

    // Decodifica Base64 y convierte a JSON
    const json = JSON.parse(
      decodeURIComponent(
        atob(padded)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    return json;
  } catch {
    return null;
  }
}

// Verifica si un JWT está expirado
function isJwtExpired(token: string, skewSec = 60): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return now + skewSec >= Number(payload.exp);
}

/* ====== BASIC SESSION ====== */

// Guarda access token y username en localStorage
export const saveSession = (accessToken: string, username: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken || "");
  localStorage.setItem(USERNAME_KEY, username);
};

// Limpia todos los datos de sesión
export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(UNIQUE_NAME_KEY);
};

// Getters de datos de sesión
export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getUsername   = (): string | null => localStorage.getItem(USERNAME_KEY);
export const getName       = (): string | null => localStorage.getItem(NAME_KEY);
export const getUniqueName = (): string | null => localStorage.getItem(UNIQUE_NAME_KEY);
export const getIdToken    = (): string | null => localStorage.getItem(ID_TOKEN_KEY);

// Guarda el ID Token
export const setIdToken = (idToken: string) => {
  localStorage.setItem(ID_TOKEN_KEY, idToken || "");
};

/* ====== UTILIDADES DE CUENTA ====== */

// Obtiene username desde email
const getUserFromEmail = (email: string): string => email.split("@")[0];

// Obtiene username desde objeto AccountInfo de MSAL
const getUserFromAccount = (account: AccountInfo): string => {
  const email =
    (account.idTokenClaims as any)?.preferred_username ||
    account.username;
  return getUserFromEmail(email);
};

/* ====== ID TOKEN (opcional, refrescar) ====== */

// Obtiene un nuevo ID token usando MSAL
export const acquireIdToken = async (
  instance: IPublicClientApplication,
  account: AccountInfo
): Promise<string | null> => {
  try {
    const res = await instance.acquireTokenSilent({
      account,
      scopes: ["openid", "profile", "email"],
    });

    const idTok = (res as any)?.idToken || "";
    setIdToken(idTok); // Guarda el token

    const claims = decodeJwtPayload(idTok);

    // Extrae nombre y unique_name del token
    const name =
      claims?.name ??
      claims?.preferred_username ??
      "";

    const uniqueName =
      claims?.unique_name ??
      claims?.preferred_username ??
      claims?.upn ??
      "";

    try {
      if (name)       localStorage.setItem(NAME_KEY, name);
      if (uniqueName) localStorage.setItem(UNIQUE_NAME_KEY, uniqueName);
    } catch {}

    return idTok || null;
  } catch {
    return null;
  }
};

/* ====== ACCESS TOKEN (opcional) ====== */

// Obtiene Access Token para consumir APIs
export const acquireAccessToken = async (
  instance: IPublicClientApplication,
  account: AccountInfo
): Promise<string | null> => {

  // Obtiene scopes desde variables de entorno
  const scopes = (import.meta.env?.VITE_LOGIN_SCOPES || "")
    .split(" ")
    .filter(Boolean);

  const username = getUserFromAccount(account);

  // Si no hay scopes, solo guarda sesión básica
  if (scopes.length === 0) {
    saveSession("", username);
    return null;
  }

  // Procesa respuesta del token
  const handleTokenResponse = (accessToken: string) => {
    saveSession(accessToken, username);

    const claims = decodeJwtPayload(accessToken);

    const name =
      claims?.name ??
      claims?.preferred_username ??
      username;

    const uniqueName =
      claims?.unique_name ??
      claims?.preferred_username ??
      claims?.upn ??
      "";

    try {
      if (name)       localStorage.setItem(NAME_KEY, name);
      if (uniqueName) localStorage.setItem(UNIQUE_NAME_KEY, uniqueName);
    } catch {}

    return accessToken || null;
  };

  try {
    // Intenta obtener token sin interacción
    const res = await instance.acquireTokenSilent({ scopes, account });
    return handleTokenResponse(res.accessToken || "");
  } catch (err) {

    // Si requiere interacción, abre popup de login
    if (err instanceof InteractionRequiredAuthError) {
      const res = await instance.acquireTokenPopup({ scopes, account });
      return handleTokenResponse(res.accessToken || "");
    }

    console.error("[acquireAccessToken] Error:", err);

    saveSession("", username);
    return null;
  }
};

/* ====== VALIDACIÓN DE TOKEN ====== */

// Respuesta esperada del validador
export interface TokenValidationResponse {
  id: string;
  nombre: string;
  email: string | null;
}

// Resultado detallado de validación
export interface TokenValidationResult {
  ok: boolean;
  reason?: string;
  data?: TokenValidationResponse | null;
}

/** * Valida un ID token con el contrato actual: 
  - GET + Authorization: Bearer <ID_TOKEN> 
  - Respuesta JSON: { id, nombre, email } | (compat) { is_valid: { status:"OK", name? } } 
  NO cierra sesión aquí. Devuelve { ok, reason, data } y que la UI decida. */
export const validateTokenDetailed = async (idToken: string): Promise<TokenValidationResult> => {

  const validationUrl = import.meta.env.VITE_TOKEN_VALIDATION_URL;

  if (!validationUrl) {
    return { ok: false, reason: "No hay URL de validación configurada (VITE_TOKEN_VALIDATION_URL)" };
  }

  if (!idToken) {
    return { ok: false, reason: "No se recibió un ID token para validar" };
  }

  // Verifica expiración local del token
  if (isJwtExpired(idToken, 0)) {
    return { ok: false, reason: "Tu sesión ha expirado. Por favor vuelve a iniciar sesión." };
  }

  try {
    const response = await fetch(validationUrl, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${idToken}`, // Token enviado al backend
        "Accept": "application/json",
      },
    });

    const contentType = response.headers.get("content-type") || "";

    // Error HTTP
    if (!response.ok) {
      return {
        ok: false,
        reason: `No fue posible validar tu sesión (HTTP ${response.status}).`,
      };
    }

    // Verifica que la respuesta sea JSON
    if (!contentType.toLowerCase().includes("application/json")) {
      return {
        ok: false,
        reason: "El validador devolvió una respuesta no-JSON.",
      };
    }

    const data: any = await response.json();

    // Nuevo contrato de respuesta
    if ((data?.id ?? null) || (data?.nombre ?? data?.name ?? null)) {

      if ((!data?.id) && (!data?.nombre && !data?.name)) {
        return { ok: false, reason: "Respuesta inválida del validador (faltan id y nombre)." };
      }

      const normalized: TokenValidationResponse = {
        id: String(data?.id ?? "N/A"),
        nombre: String(data?.nombre ?? data?.name ?? "N/A"),
        email: data?.email ?? null,
      };

      return { ok: true, data: normalized };
    }

    // Compatibilidad con contrato antiguo
    if (data?.is_valid?.status === "OK") {

      const nombre = data?.is_valid?.nombre ?? data?.is_valid?.name ?? "N/A";
      const id     = data?.is_valid?.id     ?? "N/A";
      const email  = data?.is_valid?.email  ?? null;

      if ((!data?.is_valid?.id) && (!data?.is_valid?.name && !data?.is_valid?.nombre)) {
        return { ok: false, reason: "Respuesta inválida del validador (legacy sin id ni nombre)." };
      }

      return { ok: true, data: { id, nombre, email } };
    }

    return { ok: false, reason: "Respuesta desconocida del validador." };

  } catch (error) {
    console.error("[validateTokenDetailed] Error:", error);

    return { ok: false, reason: "Error de red al validar tu sesión." };
  }
};