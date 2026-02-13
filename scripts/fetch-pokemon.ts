/**
 * Fetches all Pokemon available in Pokemon GO from PokeAPI
 * Run with: npx ts-node scripts/fetch-pokemon.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PokemonEntry {
  id: number;
  name: string;
  displayName: string;
  spriteUrl: string;
  types: string[];
  isLegendary: boolean;
  isMythical: boolean;
  generation: number;
}

const GENERATION_MAP: Record<string, number> = {
  "generation-i": 1, "generation-ii": 2, "generation-iii": 3,
  "generation-iv": 4, "generation-v": 5, "generation-vi": 6,
  "generation-vii": 7, "generation-viii": 8, "generation-ix": 9,
};

const MAX_ID = 905;

function capitalize(s: string): string {
  return s.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function main() {
  console.log("Fetching Pokemon data...");
  const pokemon: PokemonEntry[] = [];
  const batchSize = 20;

  for (let start = 1; start <= MAX_ID; start += batchSize) {
    const end = Math.min(start + batchSize - 1, MAX_ID);
    process.stdout.write(`\r  Batch ${start}-${end} of ${MAX_ID}...`);

    const batch = await Promise.all(
      Array.from({ length: end - start + 1 }, (_, i) => {
        const id = start + i;
        return Promise.all([
          fetchJSON(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
          fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`),
        ]).then(([species, poke]) => {
          if (!species || !poke) return null;
          return {
            id,
            name: species.name,
            displayName: capitalize(species.name),
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            types: poke.types.map((t: { type: { name: string } }) => t.type.name),
            isLegendary: species.is_legendary,
            isMythical: species.is_mythical,
            generation: GENERATION_MAP[species.generation.name] || 0,
          } as PokemonEntry;
        }).catch(() => null);
      })
    );

    pokemon.push(...batch.filter((p): p is PokemonEntry => p !== null));
    await new Promise(r => setTimeout(r, 300));
  }

  pokemon.sort((a, b) => a.id - b.id);
  const outPath = path.join(__dirname, "..", "src", "data", "pokemon.json");
  fs.writeFileSync(outPath, JSON.stringify(pokemon, null, 2));
  console.log(`\nWrote ${pokemon.length} Pokemon to ${outPath}`);
}

main().catch(console.error);
