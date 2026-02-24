import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";
import "../styles/Login.css";
import saviaLogo from "../assets/images/savia-logo.png";

export default function Login() {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginPopup(loginRequest).catch(console.error);
    };

    return (
        <div className="login-container">
            <img src={saviaLogo} alt="Savia Logo" className="logo" />
            <p>Inicia sesión con tu cuenta corporativa</p>
            <button onClick={handleLogin}>
                Iniciar sesión
            </button>
        </div>
    );
}