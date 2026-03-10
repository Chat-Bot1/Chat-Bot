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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

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
                <div key={i} className={`message ${msg.from}`}>
                    {msg.from === "bot" ? (
                        <div className="message-content markdown-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <div className="message-content user-content">
                            {msg.text}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}