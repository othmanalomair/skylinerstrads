import pokemonData from "@/data/pokemon.json";
import type { Pokemon } from "@/types";

const allPokemon: Pokemon[] = pokemonData as Pokemon[];

export function getAllPokemon(): Pokemon[] {
  return allPokemon;
}

export function getPokemonById(id: number): Pokemon | undefined {
  return allPokemon.find((p) => p.id === id);
}

export function searchPokemon(query: string): Pokemon[] {
  const q = query.toLowerCase().trim();
  if (!q) return allPokemon;
  return allPokemon.filter(
    (p) =>
      p.name.includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      p.id.toString() === q
  );
}

export function isSpecialTrade(pokemon: Pokemon, isShiny: boolean): boolean {
  return pokemon.isLegendary || pokemon.isMythical || isShiny;
}

export const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-amber-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-600",
  dark: "bg-gray-700",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};
