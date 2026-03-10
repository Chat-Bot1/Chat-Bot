// Hooks de React
import { useEffect, useMemo, useState, useRef } from "react";

// Hook de MSAL para autenticación con Microsoft
import { useMsal } from "@azure/msal-react";

// Configuración de scopes para login
import { loginRequest } from "../config/authConfig";

// Funciones de sesión y validación
import {
    setIdToken,
    acquireAccessToken,
    clearSession,
    saveSession,
    validateTokenDetailed,
} from "../config/session";

// Estilos de la vista login
import "../styles/Login.css";

// Logo de la aplicación
import saviaLogo from "../assets/images/savia-logo_.png";

// Hook para traducciones
import { useTranslation } from "react-i18next";

// Tiempo antes de cerrar sesión automáticamente si falla validación
const AUTO_LOGOUT_MS = 3500;

export default function Login() {
    // Hook de traducción
    const { t, i18n } = useTranslation(["login"]);

    // Instancia de MSAL
    const { instance } = useMsal();

    // Agrega una clase especial al body mientras esta vista está montada
    useEffect(() => {
        document.body.classList.add("login-page");
        return () => document.body.classList.remove("login-page");
    }, []);

    // Mensaje de error mostrado en pantalla
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Estado que indica si se está validando la sesión
    const [validating, setValidating] = useState<boolean>(false);

    // Referencia para controlar el temporizador de auto logout
    const logoutTimer = useRef<number | null>(null);

    // Limpia el temporizador al desmontar el componente
    useEffect(() => {
        return () => {
            if (logoutTimer.current) window.clearTimeout(logoutTimer.current);
        };
    }, []);

    // Detecta el idioma actual
    const currentLang = useMemo(() => {
        const lng = i18n.resolvedLanguage || i18n.language || "es";
        return lng.split("-")[0];
    }, [i18n.language, i18n.resolvedLanguage]);

    // Cambia idioma y lo guarda en localStorage
    const handleChangeLanguage = async (lng: "es" | "en") => {
        await i18n.changeLanguage(lng);
        localStorage.setItem("lang", lng);
        document.documentElement.lang = lng;
    };

    // Maneja el flujo completo de login
    const handleLogin = async () => {
        try {
            setErrorMsg("");
            setValidating(false);

            // 1) Inicia sesión con popup de Microsoft Entra ID
            const res = await instance.loginPopup(loginRequest);

            // 2) Guarda sesión básica e ID token
            const idToken: string = (res as any)?.idToken || "";
            const username = res.account?.username || "usuario";
            saveSession("", username);
            setIdToken(idToken);

            // 3) Intenta obtener access token si hay cuenta
            if (res.account) {
                await acquireAccessToken(instance, res.account).catch(console.error);
            }

            // 4) Valida externamente el ID token
            setValidating(true);
            const result = await validateTokenDetailed(idToken);
            setValidating(false);

            if (!result.ok) {
                // Muestra error si el token no es válido
                setErrorMsg(result.reason || t("alertUnexpected"));

                // Programa cierre automático de sesión
                if (AUTO_LOGOUT_MS > 0) {
                    logoutTimer.current = window.setTimeout(async () => {
                        try { clearSession(); } catch { }
                        try { await instance.logoutPopup(); } catch { }
                    }, AUTO_LOGOUT_MS);
                }
                return;
            }

            // 5) Si el token es válido, entra a la app
            window.location.replace("/");
        } catch (error: any) {
            setValidating(false);

            // Ignora errores comunes si el usuario cierra el popup
            if (error?.errorCode === "user_cancelled" || error?.errorCode === "popup_window_error") {
                return;
            }

            console.error("Error en login:", error);
            setErrorMsg(t("alertUnexpected"));
        }
    };

    // Cierra sesión manualmente de inmediato
    const handleLogoutNow = async () => {
        if (logoutTimer.current) {
            window.clearTimeout(logoutTimer.current);
            logoutTimer.current = null;
        }
        try { clearSession(); } catch { }
        try { await instance.logoutPopup(); } catch { }
    };

    return (
        <div className="login-fullscreen">
            <div className="login-container">
                <div className="login-card" role="region" aria-label="Login">
                    <img src={saviaLogo} alt="Savia Logo" className="logo" />
                    <p>{t("tagline")}</p>

                    {validating ? (
                        // Mensaje mientras se valida la sesión
                        <div className="login-alert" role="status" aria-live="polite">
                            <p>{t("validating") || "Validando sesión..."}</p>
                        </div>
                    ) : errorMsg ? (
                        // Mensaje de error si falla el login o la validación
                        <div className="login-alert login-alert--error" role="alert" aria-live="polite">
                            <strong>{t("alertTransientTitle")}</strong>
                            <div style={{ marginTop: 6 }}>{errorMsg}</div>

                            <div className="login-alert__actions" style={{ marginTop: 10 }}>
                                <button className="btn-logout" onClick={handleLogoutNow}>
                                    {t("logout") || "Cerrar sesión"}
                                </button>
                            </div>

                            {AUTO_LOGOUT_MS > 0 && (
                                <div style={{ marginTop: 8, fontSize: 12, opacity: .8 }}>
                                    Se cerrará la sesión automáticamente en {Math.round(AUTO_LOGOUT_MS / 1000)}s…
                                </div>
                            )}
                        </div>
                    ) : (
                        // Botón principal para iniciar sesión
                        <button className="btn-login" onClick={handleLogin}>
                            {t("signIn")}
                        </button>
                    )}

                    {/* Selector de idioma */}
                    <div className="lang-switch">
                        <label className="lang-switch__label">{t("languageLabel")}</label>
                        <select
                            className="lang-switch__select"
                            value={currentLang === "en" ? "en" : "es"}
                            onChange={(e) => handleChangeLanguage(e.target.value as "es" | "en")}
                        >
                            <option value="es">{t("spanish")}</option>
                            <option value="en">{t("english")}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}