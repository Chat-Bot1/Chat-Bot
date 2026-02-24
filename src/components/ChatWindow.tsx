import "./ChatWindow.css";

interface Message {
    from: "user" | "bot";
    text: string;
}

interface ChatWindowProps {
    messages: Message[];
}

function ChatWindow({ messages }: ChatWindowProps) {
    return (
        <div className="chat-window">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`chat-message ${msg.from}`}
                >
                    {msg.text}
                </div>
            ))}
        </div>
    );
}

export default ChatWindow;