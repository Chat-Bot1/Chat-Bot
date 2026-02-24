import { useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";

import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import Header from "./components/Header";
import Login from "./pages/Login";

import "./App.css";

/* 🔧 CONFIGURACIÓN */
const USE_MOCK_API = true;
const API_URL = "https://jsonplaceholder.typicode.com/posts";

/* 🧠 TIPOS */
interface Message {
    from: "user" | "bot";
    text: string;
}

const SESSION_KEY = "chatbot_session_id";

const getSessionId = () => {
    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
        sessionId = `SESSION_${Date.now()}`;
        localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
};

function App() {
    /* 🔐 ENTRA ID */
    const isAuthenticated = useIsAuthenticated();
    const { instance, accounts } = useMsal();

    /* 👤 USUARIO AUTENTICADO */
    const username = accounts.length > 0
        ? accounts[0].username
        : "Usuario";

    const handleLogout = () => {
        instance.logoutPopup().catch(console.error);
    };

    /* 💬 ESTADO DEL CHAT */
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    /* 🔌 LLAMADA A LA API */
    const sendMessageToApi = async (text: string) => {
        try {
            setLoading(true);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: getSessionId(), // luego usaremos el token
                    request_id: Date.now().toString(),
                    text: text,
                }),
            });

            if (!response.ok) {
                throw new Error("Error HTTP");
            }

            const data = await response.json();

            // 🟡 MODO MOCK
            if (USE_MOCK_API) {
                return `Echo mock: ${text}`;
            }

            // 🟢 MODO REAL
            if (data.status !== "Succes") {
                throw new Error("Error de negocio");
            }

            return data.response;
        } catch (error) {
            console.error(error);
            return "❌ Error al conectar con el bot";
        } finally {
            setLoading(false);
        }
    };

    /* 📩 ENVÍO DE MENSAJES */
    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput("");

        setMessages((prev) => [
            ...prev,
            { from: "user", text: userMessage },
            { from: "bot", text: "🤖 escribiendo..." },
        ]);

        const botResponse = await sendMessageToApi(userMessage);

        setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
                from: "bot",
                text: botResponse,
            };
            return updated;
        });
    };

    /* 🔀 RUTEO SIMPLE POR AUTENTICACIÓN */
    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <div className="app">
            {/* 🧠 HEADER */}
            <Header
                username={username}
                onLogout={handleLogout}
            />

            {/* 💬 CHAT */}
            <ChatWindow messages={messages} />
            <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                disabled={loading}
            />
        </div>
    );
}

export default App;