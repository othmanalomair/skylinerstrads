"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PokemonSearch } from "./PokemonSearch";
import { TYPE_COLORS } from "@/lib/pokemon";
import type { Pokemon } from "@/types";

interface PokemonPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (pokemon: Pokemon, options: { isShiny: boolean; isMirror: boolean; isDynamax: boolean }) => void;
  allPokemon: Pokemon[];
  excludeIds?: Set<string>;
}

export function PokemonPicker({ open, onClose, onSelect, allPokemon, excludeIds }: PokemonPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isShiny, setIsShiny] = useState(false);
  const [isMirror, setIsMirror] = useState(false);
  const [isDynamax, setIsDynamax] = useState(false);
  const [genFilter, setGenFilter] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = allPokemon;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.includes(q) || p.id.toString() === q
      );
    }
    if (genFilter) {
      list = list.filter((p) => p.generation === genFilter);
    }
    return list;
  }, [allPokemon, search, genFilter]);

  const handleSelect = useCallback(() => {
    if (!selectedPokemon) return;
    onSelect(selectedPokemon, { isShiny, isMirror, isDynamax });
    setSelectedPokemon(null);
    setIsShiny(false);
    setIsMirror(false);
    setIsDynamax(false);
    setSearch("");
    onClose();
  }, [selectedPokemon, isShiny, isMirror, isDynamax, onSelect, onClose]);

  const handleClose = () => {
    setSelectedPokemon(null);
    setIsShiny(false);
    setIsMirror(false);
    setIsDynamax(false);
    setSearch("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Select Pokemon">
      {selectedPokemon ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedPokemon(null)} className="text-sm text-blue-600 hover:underline">
            ← Back to list
          </button>
          <div className="flex items-center gap-4">
            <Image
              src={selectedPokemon.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`}
              alt={selectedPokemon.name}
              width={96}
              height={96}
              className="drop-shadow-lg"
            />
            <div>
              <p className="text-xs text-gray-400 font-mono">#{selectedPokemon.id.toString().padStart(3, "0")}</p>
              <p className="text-lg font-bold capitalize">{selectedPokemon.name}</p>
              <div className="flex gap-1 mt-1">
                {selectedPokemon.types.map((type) => (
                  <span key={type} className={`text-xs text-white px-2 py-0.5 rounded ${TYPE_COLORS[type] || "bg-gray-400"}`}>
                    {type}
                  </span>
                ))}
              </div>
              {(selectedPokemon.isLegendary || selectedPokemon.isMythical) && (
                <Badge variant="legendary" className="mt-1">
                  👑 {selectedPokemon.isLegendary ? "Legendary" : "Mythical"} - Special Trade
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Tags:</p>
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-amber-50 transition-colors">
              <input type="checkbox" checked={isShiny} onChange={(e) => setIsShiny(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
              <span className="text-lg">✦</span>
              <div>
                <p className="text-sm font-medium">Shiny</p>
                <p className="text-xs text-gray-500">Special trade required</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-green-50 transition-colors">
              <input type="checkbox" checked={isMirror} onChange={(e) => setIsMirror(e.target.checked)} className="rounded text-green-500 focus:ring-green-500" />
              <span className="text-lg">🔄</span>
              <div>
                <p className="text-sm font-medium">Mirror</p>
                <p className="text-xs text-gray-500">Both trainers trade the same species</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-pink-50 transition-colors">
              <input type="checkbox" checked={isDynamax} onChange={(e) => setIsDynamax(e.target.checked)} className="rounded text-pink-500 focus:ring-pink-500" />
              <span className="text-lg">🔮</span>
              <div>
                <p className="text-sm font-medium">Dynamax</p>
                <p className="text-xs text-gray-500">Dynamax/Gigantamax variant</p>
              </div>
            </label>
          </div>

          <Button onClick={handleSelect} className="w-full" size="lg">
            Add to List
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <PokemonSearch onSearch={setSearch} placeholder="Search by name or number..." />

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setGenFilter(null)}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap ${!genFilter ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              All
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((gen) => (
              <button
                key={gen}
                onClick={() => setGenFilter(gen)}
                className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap ${genFilter === gen ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Gen {gen}
              </button>
            ))}
          </div>

          <div className="h-[400px] overflow-y-auto space-y-1">
            {filtered.slice(0, 100).map((p) => {
              const key = `${p.id}`;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPokemon(p)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Image
                    src={p.spriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                    alt={p.name}
                    width={40}
                    height={40}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">#{p.id.toString().padStart(3, "0")}</span>
                      <span className="text-sm font-medium capitalize truncate">{p.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {p.types.map((type) => (
                        <span key={type} className={`text-[10px] text-white px-1.5 py-0.5 rounded ${TYPE_COLORS[type] || "bg-gray-400"}`}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  {(p.isLegendary || p.isMythical) && (
                    <span className="text-xs">👑</span>
                  )}
                </button>
              );
            })}
            {filtered.length > 100 && (
              <p className="text-center text-sm text-gray-400 py-2">
                Showing first 100 of {filtered.length} results. Refine your search.
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
