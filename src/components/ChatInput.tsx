// Importa los estilos CSS del chat
import "../styles/Chat.css";

// Hook para manejar traducciones (i18n)
import { useTranslation } from "react-i18next";

// Props que recibe el componente
interface ChatInputProps {
  value: string; // Texto actual del input
  onChange: (value: string) => void; // Función para actualizar el texto
  onSend: () => void; // Función para enviar el mensaje
  disabled?: boolean; // Indica si el input/botón están deshabilitados
}

// Componente de entrada de mensajes del chat
export default function ChatInput({ value, onChange, onSend, disabled = false }: ChatInputProps) {

  // Hook para obtener textos traducidos
  const { t } = useTranslation(["chat"]);

  return (
    // Contenedor del input y botón
    <div className="input-container">

      <input
        value={value} // Valor controlado por el componente padre

        // Actualiza el texto al escribir
        onChange={(e) => onChange(e.target.value)}

        // Envía el mensaje al presionar Enter
        onKeyDown={(e) => e.key === "Enter" && !disabled && onSend()}

        disabled={disabled} // Deshabilita el input si corresponde

        placeholder={t("inputPlaceholder")} // Texto placeholder traducido
      />

      <button
        onClick={onSend} // Envía el mensaje al hacer click
        disabled={disabled} // Deshabilita el botón si corresponde
      >
        {t("send")} {/* Texto del botón traducido */}
      </button>

    </div>
  );
}