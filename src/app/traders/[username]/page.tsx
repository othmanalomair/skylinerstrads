"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PokemonGrid } from "@/components/pokemon/PokemonGrid";
import { TEAM_COLORS, STARDUST_COSTS } from "@/types";
import type { PokemonListEntry } from "@/types";

interface TraderData {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  trainerCode: string | null;
  trainerCode2: string | null;
  team: "MYSTIC" | "VALOR" | "INSTINCT" | null;
  createdAt: string;
  wantList: PokemonListEntry[];
  offerList: PokemonListEntry[];
  wantCount: number;
  offerCount: number;
}

export default function TraderProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [trader, setTrader] = useState<TraderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"want" | "offer">("want");

  useEffect(() => {
    fetch(`/api/traders/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setTrader)
      .catch(() => setTrader(null))
      .finally(() => setLoading(false));
  }, [username]);

  const handleMessage = async () => {
    if (!session || !trader) return;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: trader.id }),
      });
      const data = await res.json();
      router.push(`/messages/${data.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-2">😢</div>
        <p className="text-gray-500">Trainer not found</p>
      </div>
    );
  }

  const teamColor = trader.team ? TEAM_COLORS[trader.team] : null;
  const isOwnProfile = session?.user?.username === trader.username;

  const listToShow = tab === "want" ? trader.wantList : trader.offerList;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              username={trader.username}
              displayName={trader.displayName}
              avatarUrl={trader.avatarUrl}
              team={trader.team}
              size="lg"
            />
            <div>
              <h1 className="text-xl font-bold">{trader.displayName || trader.username}</h1>
              <p className="text-sm text-gray-500">@{trader.username}</p>
              {trader.team && (
                <Badge variant="team" className={`mt-1 ${teamColor?.light} ${teamColor?.text}`}>
                  Team {trader.team.charAt(0) + trader.team.slice(1).toLowerCase()}
                </Badge>
              )}
            </div>
          </div>
          {session && !isOwnProfile && (
            <Button onClick={handleMessage} size="sm">
              💬 Message
            </Button>
          )}
          {isOwnProfile && (
            <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/edit")}>
              Edit Profile
            </Button>
          )}
        </div>

        {trader.bio && <p className="text-sm text-gray-600 mt-3">{trader.bio}</p>}

        {trader.trainerCode && (
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Trainer Code</p>
              <p className="text-lg font-mono font-bold tracking-wider">{trader.trainerCode}</p>
            </div>
            {trader.trainerCode2 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Second Trainer Code</p>
                <p className="text-lg font-mono font-bold tracking-wider">{trader.trainerCode2}</p>
              </div>
            )}
          </div>
        )}

        {/* Stardust costs info */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {Object.entries(STARDUST_COSTS).map(([level, costs]) => (
            <div key={level} className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-gray-500 capitalize">{level.replace("_", " ")}</p>
              <p className="font-semibold">{costs.standard.toLocaleString()} ✨</p>
              <p className="text-amber-600">{costs.special.toLocaleString()} (special)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Want/Offer Tabs */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setTab("want")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "want"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🔍 Wants ({trader.wantCount})
          </button>
          <button
            onClick={() => setTab("offer")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === "offer"
                ? "text-green-600 border-b-2 border-green-600 bg-green-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🤝 Offers ({trader.offerCount})
          </button>
        </div>

        <div className="p-4">
          <PokemonGrid
            pokemon={listToShow.map((e) => ({
              id: e.pokemonId,
              name: e.pokemonName,
              spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${e.pokemonId}.png`,
              types: [],
              isShiny: e.isShiny,
              isMirror: e.isMirror,
              isDynamax: e.isDynamax,
            }))}
            emptyMessage={`No Pokemon in ${tab === "want" ? "want" : "offer"} list yet`}
          />
        </div>
      </div>
    </div>
  );
}
