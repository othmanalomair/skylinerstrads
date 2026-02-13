"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Spinner } from "@/components/ui/Spinner";
import { getSocket } from "@/lib/socket";
import type { ConversationPreview } from "@/types";

export default function MessagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = getSocket();
    socket.emit("join", session.user.id);

    socket.on("conversation-updated", () => {
      fetchConversations();
    });

    return () => {
      socket.off("conversation-updated");
    };
  }, [session?.user?.id, fetchConversations]);

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    // On mobile, navigate to the conversation page
    if (window.innerWidth < 768) {
      router.push(`/messages/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  const activeConv = conversations.find((c) => c.id === activeConversation);

  return (
    <div className="flex h-full">
      {/* Conversation List - always visible on desktop, only visible on mobile when no active chat */}
      <div className={`w-full md:w-80 lg:w-96 border-r bg-white flex flex-col ${activeConversation ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeId={activeConversation || undefined}
            onSelect={handleSelectConversation}
          />
        </div>
      </div>

      {/* Chat Window - only on desktop split pane */}
      <div className="hidden md:flex flex-1 flex-col">
        {activeConversation && activeConv ? (
          <ChatWindow
            conversationId={activeConversation}
            conversation={activeConv}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-3">💬</div>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
