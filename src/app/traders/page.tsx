"use client";

import { useState, useEffect } from "react";
import { PokemonSearch } from "@/components/pokemon/PokemonSearch";
import { TraderCard } from "@/components/trade/TraderCard";
import { Spinner } from "@/components/ui/Spinner";
import type { TraderProfile } from "@/types";

export default function TradersPage() {
  const [traders, setTraders] = useState<TraderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pokemonSearch, setPokemonSearch] = useState("");
  const [listType, setListType] = useState<"" | "WANT" | "OFFER">("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (pokemonSearch) params.set("pokemon", pokemonSearch);
      if (listType) params.set("listType", listType);
      fetch(`/api/traders?${params}`)
        .then((res) => res.json())
        .then((data) => setTraders(data.traders))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, pokemonSearch, listType]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Find Traders</h1>

      <div className="space-y-3 mb-6">
        <PokemonSearch
          onSearch={setSearch}
          placeholder="Search by trainer name..."
        />
        <PokemonSearch
          onSearch={setPokemonSearch}
          placeholder="Search by Pokemon name..."
        />
        {pokemonSearch && (
          <div className="flex gap-2">
            {[
              { value: "" as const, label: "All", style: "bg-gray-100 text-gray-700 border-gray-300" },
              { value: "OFFER" as const, label: "Offers", style: "bg-green-50 text-green-700 border-green-300" },
              { value: "WANT" as const, label: "Wants", style: "bg-blue-50 text-blue-700 border-blue-300" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setListType(opt.value)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  listType === opt.value
                    ? `${opt.style} ring-2 ring-offset-1`
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : traders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>
            No traders found
            {pokemonSearch ? ` with "${pokemonSearch}" in their lists` : search ? ` matching "${search}"` : ""}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {traders.map((trader) => (
            <TraderCard key={trader.id} trader={trader} />
          ))}
        </div>
      )}
    </div>
  );
}
