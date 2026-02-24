import "../styles/Chat.css";

interface Message {
    from: "user" | "bot";
    text: string;
}

interface ChatWindowProps {
    messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
    return (
        <div className="chat-container">
            {messages.map((msg, i) => (
                <div
                    key={i}
                    className={`message ${msg.from}`}
                >
                    {msg.text}
                </div>
            ))}
        </div>
    );
}