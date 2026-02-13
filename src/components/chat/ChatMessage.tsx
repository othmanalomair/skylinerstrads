"use client";

interface ChatMessageProps {
  content: string;
  createdAt: string;
  isOwn: boolean;
  readAt: string | null;
}

export function ChatMessage({ content, createdAt, isOwn, readAt }: ChatMessageProps) {
  const time = new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        <div className={`flex items-center gap-1 justify-end mt-0.5 ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
          <span className="text-[10px]">{time}</span>
          {isOwn && (
            <span className="text-[10px]">{readAt ? "✓✓" : "✓"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
