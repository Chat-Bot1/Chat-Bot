// import "../styles/Chat.css";

// interface Message {
//     from: "user" | "bot";
//     text: string;
// }

// interface ChatWindowProps {
//     messages: Message[];
// }

// export default function ChatWindow({ messages }: ChatWindowProps) {
//     return (
//         <div className="chat-container">
//             {messages.map((msg, i) => (
//                 <div
//                     key={i}
//                     className={`message ${msg.from}`}
//                 >
//                     {msg.text}
//                 </div>
//             ))}
//         </div>
//     );
// }

import "../styles/Chat.css";
import TypingMessage from "./TypingMessage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useCallback, useEffect, useMemo, useRef } from "react";

interface Message {
  from: "user" | "bot";
  text: string;
  isThinking?: boolean;
}

interface ChatWindowProps {
  messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  const chatRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    });
  }, []);

  const lastBotMessageIndex = useMemo(() => {
    return [...messages]
      .map((msg, index) => ({ ...msg, index }))
      .filter((msg) => msg.from === "bot")
      .pop()?.index;
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="chat-container" ref={chatRef}>
      {messages.map((msg, i) => {
        const isLastBotMessage = msg.from === "bot" && i === lastBotMessageIndex;

        return (
        //   <div key={i} className={`message ${msg.from}`}>
        <div
            key={i}
            className={`message ${msg.from} ${msg.isThinking ? "thinking" : ""}`}
        >
            {/* {msg.from === "bot" ? (
              isLastBotMessage ? (
                <TypingMessage
                  key={`typing-${i}-${msg.text.length}`}
                  text={msg.text}
                  speed={18}
                  onTypingProgress={scrollToBottom}
                />
              ) : (
                <div className="message-content markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {String(msg.text || "").replace(/\\n/g, "\n")}
                  </ReactMarkdown>
                </div>
              )
            ) : (
              <div className="message-content user-content">{msg.text}</div>
            )} */}
            {msg.from === "bot" ? (
                msg.isThinking ? (
                    <div className="message-content typing-content">{msg.text}</div>
                ) : isLastBotMessage ? (
                    <TypingMessage
                    key={`typing-${i}-${msg.text.length}`}
                    text={msg.text}
                    speed={18}
                    onTypingProgress={scrollToBottom}
                    />
                ) : (
                    <div className="message-content markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {String(msg.text || "").replace(/\\n/g, "\n")}
                    </ReactMarkdown>
                    </div>
                )
                ) : (
                <div className="message-content user-content">{msg.text}</div>
                )}
          </div>
        );
      })}
    </div>
  );
}