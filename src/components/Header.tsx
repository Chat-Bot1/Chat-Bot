import "../styles/Header.css";
import saviaLogo from "../assets/images/savia-logo.png";

interface HeaderProps {
    username: string;
    onLogout: () => void;
}

export default function Header({ username, onLogout }: HeaderProps) {
    return (
        <header className="header">
            <img src={saviaLogo} alt="Savia Logo" className="logo" />

            <div className="session-info">
                <span>Sesión: <strong>{username}</strong></span>
                <button onClick={onLogout}>Cerrar sesión</button>
            </div>
        </header>
    );
}