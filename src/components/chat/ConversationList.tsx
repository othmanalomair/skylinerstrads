"use client";

import { Avatar } from "@/components/ui/Avatar";
import type { ConversationPreview } from "@/types";

interface ConversationListProps {
  conversations: ConversationPreview[];
  activeId?: string;
  onSelect: (id: string) => void;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString();
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-2">💬</div>
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Visit a trainer&apos;s profile to start chatting</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${
            activeId === conv.id ? "bg-blue-50" : ""
          }`}
        >
          <Avatar
            username={conv.otherUser.username}
            displayName={conv.otherUser.displayName}
            team={conv.otherUser.team as "MYSTIC" | "VALOR" | "INSTINCT" | null}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm truncate">
                {conv.otherUser.displayName || conv.otherUser.username}
              </p>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                {timeAgo(conv.lastMessageAt)}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {conv.lastMessageText || "No messages yet"}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
              {conv.unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
