"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { TYPE_COLORS } from "@/lib/pokemon";

interface PokemonCardProps {
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
  onClick?: () => void;
  onRemove?: () => void;
  compact?: boolean;
}

export function PokemonCard({
  id,
  displayName,
  name,
  spriteUrl,
  types,
  isShiny,
  isMirror,
  isDynamax,
  isLegendary,
  isMythical,
  notes,
  onClick,
  onRemove,
  compact,
}: PokemonCardProps) {
  const label = displayName || name.charAt(0).toUpperCase() + name.slice(1);

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`relative flex items-center gap-2 p-2 rounded-lg border bg-white hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""}`}
      >
        <Image src={spriteUrl} alt={name} width={40} height={40} className="pixelated" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{label}</p>
          <div className="flex gap-1 flex-wrap">
            {isShiny && <Badge variant="shiny">✦ Shiny</Badge>}
            {isMirror && <Badge variant="mirror">🔄 Mirror</Badge>}
            {isDynamax && <Badge variant="dynamax">🔮 Dynamax</Badge>}
          </div>
        </div>
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 hover:bg-red-100 rounded text-red-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border bg-white p-3 hover:shadow-lg transition-all ${onClick ? "cursor-pointer hover:scale-[1.02]" : ""} ${isShiny ? "ring-2 ring-amber-300" : ""}`}
    >
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-1 right-1 p-1 hover:bg-red-100 rounded-full text-red-400 hover:text-red-600 z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex justify-center mb-2">
        <Image
          src={spriteUrl}
          alt={name}
          width={80}
          height={80}
          className="drop-shadow-md"
        />
      </div>

      <p className="text-xs text-gray-400 font-mono">#{id.toString().padStart(3, "0")}</p>
      <p className="text-sm font-semibold truncate">{label}</p>

      <div className="flex gap-1 mt-1">
        {types.map((type) => (
          <span
            key={type}
            className={`text-[10px] text-white px-1.5 py-0.5 rounded ${TYPE_COLORS[type] || "bg-gray-400"}`}
          >
            {type}
          </span>
        ))}
      </div>

      <div className="flex gap-1 mt-1.5 flex-wrap">
        {isShiny && <Badge variant="shiny">✦ Shiny</Badge>}
        {isMirror && <Badge variant="mirror">🔄 Mirror</Badge>}
        {isDynamax && <Badge variant="dynamax">🔮 Dynamax</Badge>}
        {(isLegendary || isMythical) && <Badge variant="legendary">👑 {isLegendary ? "Legendary" : "Mythical"}</Badge>}
      </div>

      {notes && <p className="text-xs text-gray-500 mt-1 truncate">{notes}</p>}
    </div>
  );
}
