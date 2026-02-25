import "../styles/Chat.css";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled?: boolean; 
}

export default function ChatInput({
    value,
    onChange,
    onSend,
    disabled = false,
}: ChatInputProps) {
    return (
        <div className="input-container">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !disabled && onSend()}
                disabled={disabled}
                placeholder="Escribe tu mensaje..."
            />
            <button onClick={onSend} disabled={disabled}>
                Enviar
            </button>
        </div>
    );
}