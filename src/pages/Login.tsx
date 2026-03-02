import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";
import {
    setIdToken,
    validateIdTokenExternal,
    acquireAccessToken,
    clearSession,
    saveSession,
} from "../config/session";
import "../styles/Login.css";
import saviaLogo from "../assets/images/savia-logo_.png";

type ValidationErrorType = "denied" | "transient" | null;

export default function Login() {
    useEffect(() => {
        document.body.classList.add("login-page");
        return () => document.body.classList.remove("login-page");
    }, []);

    const { instance } = useMsal();

    const [errorType, setErrorType] = useState<ValidationErrorType>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const handleLogin = async () => {
        try {
            // 1) Autenticación OIDC (ID token)
            const res = await instance.loginPopup(loginRequest);

            const idToken: string = (res as any)?.idToken || "";
            const username = res.account?.username || "usuario";

            // Guardamos "username" (compat) y el id_token (para validaciones posteriores)
            saveSession("", username);
            setIdToken(idToken);

            // 2) Validación externa del ID token
            const validation = await validateIdTokenExternal(idToken);

            if (!validation.ok) {
                // Mostrar mensaje claro sin desloguear todavía
                if (validation.denied) {
                    setErrorType("denied");
                    setErrorMsg(
                        "No fue posible validar tu sesión. El token ha sido rechazado por el validador."
                    );
                } else {
                    setErrorType("transient");
                    setErrorMsg(
                        "No fue posible validar tu sesión en este momento. Revisa tu conexión e inténtalo nuevamente."
                    );
                }
                return;
            }

            // (Pequeño delay para asegurar persistencia de token_valid)
            await new Promise((r) => setTimeout(r, 150));

            // 3) Pedimos ACCESS TOKEN (para claims de acceso)
            await acquireAccessToken(instance, res.account!);

            // 4) Redirigimos a la App
            window.location.replace("/");
        } catch (error) {
            console.error("Error en login:", error);
            setErrorType("transient");
            setErrorMsg("Ocurrió un error inesperado durante el inicio de sesión.");
        }
    };

    const handleRetryValidation = async () => {
        setErrorType(null);
        setErrorMsg("");
        await handleLogin();
    };

    const handleLogout = async () => {
        try {
            clearSession();
            await instance.logoutPopup();
        } catch (e) {
            console.warn("Error cerrando sesión:", e);
        }
    };

    return (
        <div className="login-fullscreen">
            <div className="login-container">
                <div className="login-card" role="region" aria-label="Inicio de sesión">
                    <img src={saviaLogo} alt="Savia Logo" className="logo" />
                    <p>Gestiona tus consultas usando nuestra IA</p>

                    {errorType ? (
                        <div
                            className={`login-alert ${errorType === "denied" ? "login-alert--error" : "login-alert--warn"
                                }`}
                            role="alert"
                            aria-live="polite"
                        >
                            <strong>
                                {errorType === "denied" ? "Validación rechazada" : "No se pudo validar"}
                            </strong>
                            <div style={{ marginTop: 6 }}>{errorMsg}</div>

                            <div className="login-alert__actions">
                                {errorType === "transient" && (
                                    <button className="btn-retry" onClick={handleRetryValidation}>
                                        Reintentar
                                    </button>
                                )}
                                <button className="btn-logout" onClick={handleLogout}>
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button className="btn-login" onClick={handleLogin}>
                            Iniciar sesión
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}