import "../styles/Chat.css";

interface ChatInputProps {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
}

export default function ChatInput({ value, onChange, onSend }: ChatInputProps) {
    return (
        <div className="input-container">
            <input
                type="text"
                placeholder="Escribe tu pregunta..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
            />
            <button onClick={onSend}>Enviar</button>
        </div>
    );
}