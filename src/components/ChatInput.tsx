import "./ChatInput.css";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
}

function ChatInput({ value, onChange, onSend }: ChatInputProps) {
    return (
        <div className="chat-input">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <button onClick={onSend}>Enviar</button>
        </div>
    );
}

export default ChatInput;