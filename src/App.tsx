import { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./App.css";

interface Message {
    from: "user" | "bot";
    text: string;
}

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages((prev) => [
            ...prev,
            { from: "user", text: input },
            { from: "bot", text: "Respuesta simulada 🤖" },
        ]);

        setInput("");
    };

    return (
        <div className="app">
            <h1>Chatbot Savios</h1>
            <ChatWindow messages={messages} />
            <ChatInput value={input} onChange={setInput} onSend={handleSend} />
        </div>
    );
}

export default App;