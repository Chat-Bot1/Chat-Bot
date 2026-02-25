import "../styles/Header.css";
import saviaLogo from "../assets/images/savia-logo.png";
import { getUsername } from "../config/session"; // 👈 agregado

interface HeaderProps {
    username: string;          // fallback (correo)
    displayName?: string;      // nombre real
    onLogout: () => void;
}

export default function Header({
    username,
    displayName,
    onLogout,
}: HeaderProps) {

   // const sessionName = getUsername(); // 👈 lee de localStorage

    const nameToShow = displayName || username;

    return (
        <header className="header">
            <img src={saviaLogo} alt="Savia Logo" className="logo" />

            <div className="session-info">
                <span className="session-name">
                    Hola: <strong>{nameToShow}</strong>
                </span>
                <button onClick={onLogout}>Cerrar sesión</button>
            </div>
        </header>
    );
}