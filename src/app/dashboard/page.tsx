"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { PokemonGrid } from "@/components/pokemon/PokemonGrid";
import { PokemonPicker } from "@/components/pokemon/PokemonPicker";
import { TEAM_COLORS } from "@/types";
import type { Pokemon, PokemonListEntry } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [wantList, setWantList] = useState<PokemonListEntry[]>([]);
  const [offerList, setOfferList] = useState<PokemonListEntry[]>([]);
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState<"WANT" | "OFFER">("WANT");
  const [profile, setProfile] = useState<{
    bio: string | null;
    trainerCode: string | null;
    team: string | null;
    displayName: string | null;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [listRes, pokemonMod, profileRes] = await Promise.all([
        fetch("/api/pokemon-list"),
        import("@/data/pokemon.json"),
        fetch("/api/profile"),
      ]);
      const lists = await listRes.json();
      const profileData = await profileRes.json();
      setWantList(lists.filter((l: PokemonListEntry) => l.listType === "WANT"));
      setOfferList(lists.filter((l: PokemonListEntry) => l.listType === "OFFER"));
      setAllPokemon(pokemonMod.default as Pokemon[]);
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPokemon = async (pokemon: Pokemon, options: { isShiny: boolean; isShadow: boolean; isLucky: boolean }) => {
    try {
      const res = await fetch("/api/pokemon-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pokemonId: pokemon.id,
          pokemonName: pokemon.name,
          listType: pickerType,
          isShiny: options.isShiny,
          isShadow: options.isShadow,
          isLucky: options.isLucky,
        }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to add pokemon:", error);
    }
  };

  const handleRemove = async (entry: { id?: string }) => {
    if (!entry.id) return;
    try {
      await fetch(`/api/pokemon-list/${entry.id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Failed to remove:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const teamColor = profile?.team ? TEAM_COLORS[profile.team as keyof typeof TEAM_COLORS] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              username={session?.user?.username || ""}
              displayName={profile?.displayName}
              team={profile?.team as "MYSTIC" | "VALOR" | "INSTINCT" | null}
              size="lg"
            />
            <div>
              <h1 className="text-xl font-bold">{profile?.displayName || session?.user?.username}</h1>
              <p className="text-sm text-gray-500">@{session?.user?.username}</p>
              {profile?.team && (
                <Badge variant="team" className={`mt-1 ${teamColor?.light} ${teamColor?.text}`}>
                  Team {profile.team.charAt(0) + profile.team.slice(1).toLowerCase()}
                </Badge>
              )}
            </div>
          </div>
          <Link href="/dashboard/edit">
            <Button variant="secondary" size="sm">Edit Profile</Button>
          </Link>
        </div>
        {profile?.bio && <p className="text-sm text-gray-600 mt-3">{profile.bio}</p>}
        {profile?.trainerCode && (
          <p className="text-sm text-gray-500 mt-2 font-mono">
            Trainer Code: {profile.trainerCode}
          </p>
        )}
      </div>

      {/* Want List */}
      <section className="bg-white rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            🔍 Pokemon I Want
            <span className="text-sm font-normal text-gray-500">({wantList.length})</span>
          </h2>
          <Button
            size="sm"
            onClick={() => { setPickerType("WANT"); setPickerOpen(true); }}
          >
            + Add
          </Button>
        </div>
        <PokemonGrid
          pokemon={wantList.map((e) => ({
            id: e.pokemonId,
            name: e.pokemonName,
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${e.pokemonId}.png`,
            types: [],
            isShiny: e.isShiny,
            isShadow: e.isShadow,
            isLucky: e.isLucky,
          }))}
          onRemove={(p) => {
            const entry = wantList.find(
              (e) => e.pokemonId === p.id && e.isShiny === p.isShiny && e.isShadow === p.isShadow
            );
            if (entry) handleRemove(entry);
          }}
          emptyMessage="No Pokemon in your want list yet. Add some!"
        />
      </section>

      {/* Offer List */}
      <section className="bg-white rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            🤝 Pokemon I Can Trade
            <span className="text-sm font-normal text-gray-500">({offerList.length})</span>
          </h2>
          <Button
            size="sm"
            onClick={() => { setPickerType("OFFER"); setPickerOpen(true); }}
          >
            + Add
          </Button>
        </div>
        <PokemonGrid
          pokemon={offerList.map((e) => ({
            id: e.pokemonId,
            name: e.pokemonName,
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${e.pokemonId}.png`,
            types: [],
            isShiny: e.isShiny,
            isShadow: e.isShadow,
            isLucky: e.isLucky,
          }))}
          onRemove={(p) => {
            const entry = offerList.find(
              (e) => e.pokemonId === p.id && e.isShiny === p.isShiny && e.isShadow === p.isShadow
            );
            if (entry) handleRemove(entry);
          }}
          emptyMessage="No Pokemon to trade yet. Add some!"
        />
      </section>

      <PokemonPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddPokemon}
        allPokemon={allPokemon}
      />
    </div>
  );
}
