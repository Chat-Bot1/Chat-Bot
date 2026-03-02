import "../styles/Header.css";
import saviaLogo from "../assets/images/savia-logo_.png";
import { getName, getUniqueName } from "../config/session";

interface HeaderProps {
    username: string;
    displayName?: string;
    onLogout: () => void;
    onToggleMenu?: () => void; // ← para responsive
}

export default function Header({
    username,
    displayName,
    onLogout,
    onToggleMenu,
}: HeaderProps) {
    const storedName = getName();
    const storedUnique = getUniqueName();

    const nameToShow = displayName || storedName || storedUnique || username;

    return (
        <header className="header">
            <div className="header__left">
                {/* botón hamburguesa solo en mobile */}
                <button
                    className="menu-toggle"
                    aria-label="Abrir menú"
                    onClick={onToggleMenu}
                >
                    ☰
                </button>

                <img src={saviaLogo} alt="SAV-IA" className="logo" />
            </div>

            <div className="header__right">
                <span className="welcome">
                    Hola: <strong>{nameToShow}</strong>
                </span>
                <button className="btn btn--logout" onClick={onLogout}>Cerrar Sesion</button>
            </div>
        </header>
    );
}
