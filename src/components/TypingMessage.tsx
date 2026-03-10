import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface TypingMessageProps {
  text: string;
  speed?: number;
  onTypingProgress?: () => void;
}

export default function TypingMessage({
  text,
  speed = 18,
  onTypingProgress,
}: TypingMessageProps) {
  const normalizedText = useMemo(() => {
    return String(text || "").replace(/\\n/g, "\n");
  }, [text]);

  const [displayedText, setDisplayedText] = useState("");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let index = 0;

    const typeNext = () => {
      index += 1;
      const nextText = normalizedText.slice(0, index);

      setDisplayedText(nextText);
      onTypingProgress?.();

      if (index < normalizedText.length) {
        const currentChar = normalizedText[index - 1];

        let delay = speed;
        if (currentChar === " ") delay = 8;
        if ([",", ".", ":", ";"].includes(currentChar)) delay = 50;
        if (currentChar === "\n") delay = 35;

        timeoutRef.current = window.setTimeout(typeNext, delay);
      }
    };

    if (normalizedText.length > 0) {
      timeoutRef.current = window.setTimeout(typeNext, speed);
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [normalizedText, speed, onTypingProgress]);

  const isFinished = displayedText.length >= normalizedText.length;

  if (!isFinished) {
    return (
      <div className="message-content typing-content">
        <span style={{ whiteSpace: "pre-wrap" }}>{displayedText}</span>
        <span className="typing-cursor">▍</span>
      </div>
    );
  }

  return (
    <div className="message-content markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {normalizedText}
      </ReactMarkdown>
    </div>
  );
}