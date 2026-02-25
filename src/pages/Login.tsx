import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";
import { saveSession } from "../config/session";
import "../styles/Login.css";
import saviaLogo from "../assets/images/savia-logo.png";

export default function Login() {

    useEffect(() => {
        document.body.classList.add("login-page");
        return () => document.body.classList.remove("login-page");
    }, []);

    const { instance } = useMsal();

    const handleLogin = async () => {
        try {
            const response = await instance.loginPopup(loginRequest);

            // 🔐 Guardamos sesión
            saveSession(
                response.accessToken,
                response.account?.username || "usuario"
            );

            // 🚀 Redirigir al chat
            window.location.href = "/";
        } catch (error) {
            console.error("Error en login:", error);
        }
    };

    return (
        <div className="login-container">
            <img src={saviaLogo} alt="Savia Logo" className="logo" />
            <p>Gestiona tus consultas usando nuestra IA</p>
            <button onClick={handleLogin}>
                Iniciar sesión
            </button>
        </div>
    );
}