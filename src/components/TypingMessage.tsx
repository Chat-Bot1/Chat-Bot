// Hooks de React para manejar estado, efectos y referencias
import { useEffect, useMemo, useRef, useState } from "react";

// Componente para renderizar Markdown
import ReactMarkdown from "react-markdown";

// Plugin para soportar tablas, listas, en Markdown
import remarkGfm from "remark-gfm";

// Plugin para respetar saltos de línea
import remarkBreaks from "remark-breaks";

// Props del componente TypingMessage
interface TypingMessageProps {
  text: string; // Texto completo que el bot debe escribir
  speed?: number; // Velocidad base de escritura
  onTypingProgress?: () => void; // Callback durante la animación
}

// Componente que simula el efecto de escritura del bot
export default function TypingMessage({
  text,
  speed = 18,
  onTypingProgress,
}: TypingMessageProps) {

  // Normaliza el texto reemplazando "\n" por saltos reales
  const normalizedText = useMemo(() => {
    return String(text || "").replace(/\\n/g, "\n");
  }, [text]);

  // Estado que guarda el texto que se ha mostrado hasta el momento
  const [displayedText, setDisplayedText] = useState("");

  // Referencia para controlar el timeout de la animación
  const timeoutRef = useRef<number | null>(null);

  // Efecto que ejecuta la animación de tipeo
  useEffect(() => {
    let index = 0;

    // Función que agrega un carácter en cada iteración
    const typeNext = () => {
      index += 1;

      // Obtiene el texto parcial que se mostrará
      const nextText = normalizedText.slice(0, index);

      setDisplayedText(nextText);

      // Ejecuta callback si existe (scroll automático)
      onTypingProgress?.();

      if (index < normalizedText.length) {
        const currentChar = normalizedText[index - 1];

        // Ajusta la velocidad según el carácter
        let delay = speed;
        if (currentChar === " ") delay = 8;
        if ([",", ".", ":", ";"].includes(currentChar)) delay = 50;
        if (currentChar === "\n") delay = 35;

        // Programa el siguiente carácter
        timeoutRef.current = window.setTimeout(typeNext, delay);
      }
    };

    // Inicia la animación si hay texto
    if (normalizedText.length > 0) {
      timeoutRef.current = window.setTimeout(typeNext, speed);
    }

    // Limpia el timeout al desmontar el componente
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [normalizedText, speed, onTypingProgress]);

  // Verifica si el texto ya terminó de escribirse
  const isFinished = displayedText.length >= normalizedText.length;

  // Mientras escribe: muestra texto parcial + cursor
  if (!isFinished) {
    return (
      <div className="message-content typing-content">
        <span style={{ whiteSpace: "pre-wrap" }}>{displayedText}</span>
        <span className="typing-cursor">▍</span> {/* Cursor de escritura */}
      </div>
    );
  }

  // Cuando termina: renderiza el texto completo en Markdown
  return (
    <div className="message-content markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {normalizedText}
      </ReactMarkdown>
    </div>
  );
}