import React from "react";
import "../styles/Landing.css";
import bgDesktop from "../assets/images/savia-landing_1.png";
import bgMobile from "../assets/images/savia-landing_2.png";
import logoSavia from "../assets/images/savia-logo_.png"
import btnSavia from "../assets/images/btn_savia.png";


const bg = window.innerWidth <= 320 ? bgMobile : bgDesktop;

interface LandingProps {
    onEnterApp: () => void;
    onLogout?: () => void;
    displayName?: string;
}

const Landing: React.FC<LandingProps> = ({ onEnterApp }) => {
    return (
        <div
            className="landing-root"
            style={{ backgroundImage: `url(${bg})` }}
            role="region"
            aria-label="Landing SAV-IA"
        >
            
            <header className="landing-header">
                <img src={logoSavia} alt="SAVIA" className="logoSavia" />    
                <p className="landing-subtitle">
                    CONOCIMIENTO VIVO IMPULSADO POR INTELIGENCIA ARTIFICIAL
                </p>
            </header>

            <div className="landing-body">
                <p className="landing-title">
                    BASE DE CONOCIMIENTO ORGANIZACIONAL</p>

                <p className="landing-description">
                    Accede al conocimiento institucional de tu
                    organización en un solo lugar.
                    Consulta procesos, documentos y lineamientos mediante
                    conversación.
                </p>

                <div className="landing-footer">
                    <img
                        src={btnSavia}
                        alt="Hablar con SAV-IA"
                        className="landing-btnHabla"
                        role="button"
                        tabIndex={0}
                        aria-label="Hablar con SAV-IA"
                        onClick={onEnterApp}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onEnterApp();
                            }
                        }}
                    />
                </div>
            </div>

            

        </div>
    );
};

export default Landing;
