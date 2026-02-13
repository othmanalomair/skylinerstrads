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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/traders?search=${encodeURIComponent(search)}`)
        .then((res) => res.json())
        .then((data) => setTraders(data.traders))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Find Traders</h1>

      <div className="mb-6">
        <PokemonSearch
          onSearch={setSearch}
          placeholder="Search trainers by username..."
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : traders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>No traders found{search ? ` matching "${search}"` : ""}</p>
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
