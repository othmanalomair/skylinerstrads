"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { getSocket } from "@/lib/socket";
import type { ChatMessage as ChatMessageType, ConversationPreview } from "@/types";

interface ChatWindowProps {
  conversationId: string;
  conversation?: ConversationPreview;
  onBack?: () => void;
}

export function ChatWindow({ conversationId, conversation, onBack }: ChatWindowProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load messages");
        return res.json();
      })
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        setTimeout(scrollToBottom, 100);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-conversation", conversationId);

    socket.on("new-message", (message: ChatMessageType) => {
      // Only add messages from the other user (our own messages are added in handleSend)
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setTyping(false);
      setTimeout(scrollToBottom, 50);
    });

    socket.on("user-typing", () => setTyping(true));
    socket.on("user-stop-typing", () => setTyping(false));

    return () => {
      socket.emit("leave-conversation", conversationId);
      socket.off("new-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [conversationId, scrollToBottom]);

  const handleSend = async (content: string) => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 50);

      // Broadcast via socket
      const recipientId = conversation?.otherUser?.id;
      if (recipientId) {
        const socket = getSocket();
        socket.emit("send-message", {
          conversationId,
          message,
          recipientId,
        });
      }
    } catch (error) {
      console.error("Failed to send:", error);
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    socket.emit("typing", { conversationId, userId: session?.user?.id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { conversationId, userId: session?.user?.id });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1 hover:bg-gray-100 rounded-lg md:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {conversation && (
          <>
            <Avatar
              username={conversation.otherUser.username}
              displayName={conversation.otherUser.displayName}
              avatarUrl={conversation.otherUser.avatarUrl}
              team={conversation.otherUser.team as "MYSTIC" | "VALOR" | "INSTINCT" | null}
              size="sm"
            />
            <div>
              <p className="font-medium text-sm">
                {conversation.otherUser.displayName || conversation.otherUser.username}
              </p>
              {typing && <p className="text-xs text-blue-500">typing...</p>}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No messages yet. Say hi! 👋
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              content={msg.content}
              createdAt={msg.createdAt}
              isOwn={msg.senderId === session?.user?.id}
              readAt={msg.readAt}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}
