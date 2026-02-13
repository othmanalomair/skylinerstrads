"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { TEAM_COLORS } from "@/types";
import type { TraderProfile } from "@/types";

export function TraderCard({ trader }: { trader: TraderProfile }) {
  const teamColor = trader.team ? TEAM_COLORS[trader.team] : null;

  return (
    <Link href={`/traders/${trader.username}`}>
      <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-3">
          <Avatar
            username={trader.username}
            displayName={trader.displayName}
            team={trader.team}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{trader.displayName || trader.username}</p>
              {trader.team && (
                <Badge variant="team" className={`${teamColor?.light} ${teamColor?.text}`}>
                  {trader.team.charAt(0) + trader.team.slice(1).toLowerCase()}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">@{trader.username}</p>
          </div>
        </div>

        {trader.bio && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{trader.bio}</p>
        )}

        <div className="flex gap-4 mt-3 text-sm">
          <span className="text-blue-600 font-medium">
            🔍 {trader.wantCount} wants
          </span>
          <span className="text-green-600 font-medium">
            🤝 {trader.offerCount} offers
          </span>
        </div>
      </div>
    </Link>
  );
}
