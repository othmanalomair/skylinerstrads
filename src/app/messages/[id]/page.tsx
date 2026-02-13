"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Spinner } from "@/components/ui/Spinner";
import type { ConversationPreview } from "@/types";

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load conversations");
        return res.json();
      })
      .then((data: ConversationPreview[]) => {
        const conv = data.find((c) => c.id === id);
        if (conv) setConversation(conv);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-full">
      <ChatWindow
        conversationId={id}
        conversation={conversation || undefined}
        onBack={() => router.push("/messages")}
      />
    </div>
  );
}
