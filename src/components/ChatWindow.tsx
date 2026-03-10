// Importa los estilos del chat
import "../styles/Chat.css";

// Componente que muestra animación de escritura
import TypingMessage from "./TypingMessage";

// Componente para renderizar Markdown
import ReactMarkdown from "react-markdown";

// Plugin para tablas, listas y más sintaxis Markdown
import remarkGfm from "remark-gfm";

// Plugin para respetar saltos de línea
import remarkBreaks from "remark-breaks";

// Hooks de React usados en el componente
import { useCallback, useEffect, useMemo, useRef } from "react";

// Estructura de cada mensaje
interface Message {
  from: "user" | "bot"; // Indica quién envía el mensaje
  text: string; // Contenido del mensaje
  isThinking?: boolean; // Marca si el bot está "pensando"
}

// Props del componente
interface ChatWindowProps {
  messages: Message[]; // Lista de mensajes del chat
}

// Componente que renderiza la ventana del chat
export default function ChatWindow({ messages }: ChatWindowProps) {
  // Referencia al contenedor del chat
  const chatRef = useRef<HTMLDivElement | null>(null);

  // Guarda si el auto-scroll está activo
  const autoScrollEnabledRef = useRef(true);

  // Lleva el scroll al final del chat
  const scrollToBottom = useCallback((force = false) => {
    requestAnimationFrame(() => {
      const el = chatRef.current;
      if (!el) return; // Sale si no existe el contenedor

      // Si no es forzado y el usuario subió manualmente, no baja
      if (!force && !autoScrollEnabledRef.current) return;

      // Mueve el scroll al final
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  // Detecta si el usuario está cerca del final del chat
  const handleScroll = useCallback(() => {
    const el = chatRef.current;
    if (!el) return;

    const threshold = 80; // Margen para considerar "cerca del final"
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    // Activa auto-scroll solo si está cerca del final
    autoScrollEnabledRef.current = distanceFromBottom <= threshold;
  }, []);

  // Obtiene el índice del último mensaje del bot
  const lastBotMessageIndex = useMemo(() => {
    return [...messages]
      .map((msg, index) => ({ ...msg, index })) // Agrega el índice a cada mensaje
      .filter((msg) => msg.from === "bot") // Deja solo mensajes del bot
      .pop()?.index; // Toma el último índice del bot
  }, [messages]);

  // Hace scroll al final cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Hace scroll forzado al montar el componente
  useEffect(() => {
    scrollToBottom(true);
  }, [scrollToBottom]);

  return (
    // Contenedor principal del chat con scroll
    <div className="chat-container" ref={chatRef} onScroll={handleScroll}>
      {messages.map((msg, i) => {
        // Verifica si este es el último mensaje del bot
        const isLastBotMessage = msg.from === "bot" && i === lastBotMessageIndex;

        return (
          <div
            key={i} // Clave del elemento renderizado
            className={`message ${msg.from} ${msg.isThinking ? "thinking" : ""}`} // Clases dinámicas
          >
            {msg.from === "bot" ? (
              msg.isThinking ? (
                // Mensaje temporal mientras el bot piensa
                <div className="message-content typing-content">{msg.text}</div>
              ) : isLastBotMessage ? (
                // Último mensaje del bot con efecto de escritura
                <TypingMessage
                  key={`typing-${i}-${msg.text.length}`}
                  text={msg.text}
                  speed={18} // Velocidad del tipeo
                  onTypingProgress={() => scrollToBottom()} // Mantiene scroll durante la animación
                />
              ) : (
                // Mensajes anteriores del bot renderizados como Markdown
                <div className="message-content markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {String(msg.text || "").replace(/\\n/g, "\n")} 
                  </ReactMarkdown>
                </div>
              )
            ) : (
              // Mensaje enviado por el usuario
              <div className="message-content user-content">{msg.text}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}