// src/components/SideNav.tsx
import "../styles/SideNav.css";

type ViewKey = "chat" | "config";

interface SideNavProps {
    activeKey: ViewKey;
    isOpen: boolean;                // mobile
    onSelect: (key: ViewKey) => void;
    onClose: () => void;            // mobile
}

export default function SideNav({ activeKey, isOpen, onSelect, onClose }: SideNavProps) {
    return (
        <>
            {/* Overlay para mobile */}
            <div
                className={`overlay ${isOpen ? "overlay--show" : ""}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            <aside className={`sidenav ${isOpen ? "sidenav--open" : ""}`}>
                <nav className="sidenav__nav">
                    <button
                        className={`nav-btn ${activeKey === "chat" ? "nav-btn--active" : ""}`}
                        onClick={() => onSelect("chat")}
                    >
                        Chat
                    </button>

                    <button
                        className={`nav-btn ${activeKey === "config" ? "nav-btn--active" : ""}`}
                        onClick={() => onSelect("config")}
                    >
                        Configuración
                    </button>
                </nav>
            </aside>
        </>
    );
}
``