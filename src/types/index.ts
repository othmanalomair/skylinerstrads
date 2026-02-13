export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  spriteUrl: string;
  types: string[];
  isLegendary: boolean;
  isMythical: boolean;
  generation: number;
}

export interface PokemonListEntry {
  id: string;
  pokemonId: number;
  pokemonName: string;
  listType: "WANT" | "OFFER";
  isShiny: boolean;
  isMirror: boolean;
  isDynamax: boolean;
  notes?: string;
}

export interface TraderProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  trainerCode: string | null;
  team: "MYSTIC" | "VALOR" | "INSTINCT" | null;
  wantCount: number;
  offerCount: number;
  wantList?: PokemonListEntry[];
  offerList?: PokemonListEntry[];
  matchedPokemon?: {
    pokemonName: string;
    pokemonId: number;
    listType: string;
    isShiny: boolean;
    isMirror: boolean;
    isDynamax: boolean;
  }[];
}

export interface ConversationPreview {
  id: string;
  otherUser: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    team: string | null;
  };
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

export const TEAM_COLORS = {
  MYSTIC: { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-100" },
  VALOR: { bg: "bg-red-500", text: "text-red-500", light: "bg-red-100" },
  INSTINCT: { bg: "bg-yellow-500", text: "text-yellow-500", light: "bg-yellow-100" },
} as const;

export const STARDUST_COSTS = {
  good_friend: { standard: 20000, special: 1000000 },
  great_friend: { standard: 16000, special: 800000 },
  ultra_friend: { standard: 1600, special: 80000 },
  best_friend: { standard: 100, special: 40000 },
} as const;
