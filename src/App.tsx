// Hooks de React
import { useEffect, useState } from "react";

// Hooks de MSAL para autenticación
import { useIsAuthenticated, useMsal } from "@azure/msal-react";

// Funciones de sesión
import {
    clearSession,
    acquireAccessToken,
    acquireIdToken,
    getName,
    getUniqueName,
    getIdToken,
} from "./config/session";

// Componentes principales
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import Header from "./components/Header";
import SideNav from "./components/SideNav";
import Login from "./pages/Login";

// Estilos globales
import "./App.css";

// Hook para traducciones
import { useTranslation } from "react-i18next";

// URL base de la API del chat
const RAW_API_URL = import.meta.env.VITE_CHAT_API_URL;
if (!RAW_API_URL) throw new Error("VITE_CHAT_API_URL no está definida");

// Elimina "/" final si existe
const API_URL = RAW_API_URL.replace(/\/$/, "");

// Tipo de cada mensaje del chat
interface Message {
    from: "user" | "bot";
    text: string;
    isThinking?: boolean;
}

// Vistas disponibles en el menú lateral
type ViewKey = "chat" | "config";

function App() {
    // Hook de traducción
    const { t } = useTranslation(["chat"]);

    // Estado global de autenticación
    const isAuthenticated = useIsAuthenticated();
    const { instance, accounts } = useMsal();

    // Obtiene email del usuario autenticado
    const email = accounts.length > 0 ? accounts[0].username : "";

    // Obtiene userId a partir del correo
    const userId = email.includes("@") ? email.split("@")[0] : email || "Usuario";

    // Estado de la vista activa del sidenav
    const [activeView, setActiveView] = useState<ViewKey>("chat");

    // Estado de apertura/cierre del menú lateral
    const [isSideOpen, setSideOpen] = useState<boolean>(false);

    // Estado de mensajes del chat
    const [messages, setMessages] = useState<Message[]>([]);

    // Estado del input del usuario
    const [input, setInput] = useState("");

    // Estado de carga mientras se consulta la API
    const [loading, setLoading] = useState(false);

    // Al autenticarse, obtiene tokens necesarios
    useEffect(() => {
        const primeAuthArtifacts = async () => {
            if (!isAuthenticated || accounts.length === 0) return;

            await acquireIdToken(instance, accounts[0]).catch(console.error);
            await acquireAccessToken(instance, accounts[0]).catch(console.error);
        };

        primeAuthArtifacts().catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, accounts, instance]);

    // Cierra sesión del usuario
    const handleLogout = () => {
        clearSession();
        instance.logoutPopup().catch(console.error);
    };

    // Envía mensaje al backend del chat
    const sendMessageToApi = async (text: string) => {
        try {
            setLoading(true);

            // Obtiene datos guardados de sesión
            const storedName = getName();
            const storedUnique = getUniqueName();
            const idToken = getIdToken();

            // Payload enviado al backend
            const payload = {
                session_id: storedUnique || storedName || userId,
                request_id: "1",
                text,
            };

            // Llamado HTTP POST a la API
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}` // Token para autorización
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Error HTTP");

            const data = await response.json();
            return data.response; // Respuesta del bot
        } catch (error) {
            console.error(" Error en fetch:", error);
            return t("connectError"); // Mensaje si falla conexión
        } finally {
            setLoading(false);
        }
    };

    // Maneja el envío de mensajes desde el input
    const handleSend = async () => {
        if (!input.trim() || loading) return; // Evita enviar vacío o duplicado

        const userMessage = input;
        setInput(""); // Limpia input

        // Agrega mensaje del usuario + mensaje temporal del bot
        setMessages((prev) => [
            ...prev,
            { from: "user", text: userMessage },
            { from: "bot", text: t("thinking"), isThinking: true },
        ]);

        // Obtiene respuesta real del backend
        const botResponse = await sendMessageToApi(userMessage);

        // Reemplaza el mensaje temporal por la respuesta final
        setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { from: "bot", text: botResponse, isThinking: false };
            return updated;
        });
    };

    // Si no está autenticado, muestra pantalla de login
    if (!isAuthenticated) return <Login />;

    // Nombre a mostrar en el header
    const displayName = getName() || getUniqueName() || userId;

    return (
        <div className="app">
            {/* Encabezado principal */}
            <Header
                username={userId}
                displayName={displayName}
                onLogout={handleLogout}
                onToggleMenu={() => setSideOpen((v) => !v)}
            />

            <div className="app-shell">

                {/* Menú lateral */}
                <SideNav
                    activeKey={activeView}
                    isOpen={isSideOpen}
                    onSelect={(key) => {
                        setActiveView(key);
                        setSideOpen(false);
                    }}
                    onClose={() => setSideOpen(false)}
                />

                {/* Contenido principal */}
                <main className="content">
                    {activeView === "chat" ? (
                        <section className="chat-section">

                            {/* Tarjeta del historial de mensajes */}
                            <div className="chat-card">
                                <ChatWindow messages={messages} />
                            </div>

                            {/* Input para escribir y enviar mensajes */}
                            <div className="chat-input-row">
                                <ChatInput
                                    value={input}
                                    onChange={setInput}
                                    onSend={handleSend}
                                    disabled={loading}
                                />
                            </div>

                        </section>
                    ) : (
                        // Vista placeholder para configuración
                        <section className="placeholder">
                            <h3>{t("configTitle")}</h3>
                            <p>{t("configMsg")}</p>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;