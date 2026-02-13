"use client";

import { TEAM_COLORS } from "@/types";

interface AvatarProps {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  team?: "MYSTIC" | "VALOR" | "INSTINCT" | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

export function Avatar({ username, displayName, team, size = "md" }: AvatarProps) {
  const initials = (displayName || username).slice(0, 2).toUpperCase();
  const teamColor = team ? TEAM_COLORS[team] : null;

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white ${teamColor ? teamColor.bg : "bg-gray-400"}`}
    >
      {initials}
    </div>
  );
}
