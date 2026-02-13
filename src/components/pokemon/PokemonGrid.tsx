"use client";

import { PokemonCard } from "./PokemonCard";

interface PokemonEntry {
  id: number;
  name: string;
  displayName?: string;
  spriteUrl: string;
  types: string[];
  isShiny?: boolean;
  isMirror?: boolean;
  isDynamax?: boolean;
  isLegendary?: boolean;
  isMythical?: boolean;
  notes?: string;
}

interface PokemonGridProps {
  pokemon: PokemonEntry[];
  onPokemonClick?: (pokemon: PokemonEntry) => void;
  onRemove?: (pokemon: PokemonEntry) => void;
  emptyMessage?: string;
  compact?: boolean;
}

export function PokemonGrid({ pokemon, onPokemonClick, onRemove, emptyMessage = "No Pokemon found", compact }: PokemonGridProps) {
  if (pokemon.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-2">🔍</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {pokemon.map((p) => (
          <PokemonCard
            key={`${p.id}-${p.isShiny}-${p.isMirror}`}
            {...p}
            onClick={onPokemonClick ? () => onPokemonClick(p) : undefined}
            onRemove={onRemove ? () => onRemove(p) : undefined}
            compact
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {pokemon.map((p) => (
        <PokemonCard
          key={`${p.id}-${p.isShiny}-${p.isMirror}`}
          {...p}
          onClick={onPokemonClick ? () => onPokemonClick(p) : undefined}
          onRemove={onRemove ? () => onRemove(p) : undefined}
        />
      ))}
    </div>
  );
}
