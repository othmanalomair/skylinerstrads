import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const pokemon = searchParams.get("pokemon") || "";
  const listType = searchParams.get("listType") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where: any = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" as const } },
      { displayName: { contains: search, mode: "insensitive" as const } },
    ];
  }

  if (pokemon) {
    const pokemonFilter: any = {
      pokemonName: { contains: pokemon, mode: "insensitive" as const },
    };
    if (listType === "WANT" || listType === "OFFER") {
      pokemonFilter.listType = listType;
    }
    where.pokemonLists = { some: pokemonFilter };
  }

  const [traders, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        team: true,
        trainerCode: true,
        pokemonLists: {
          select: { listType: true, pokemonName: true, pokemonId: true, isShiny: true, isMirror: true, isDynamax: true },
          ...(pokemon
            ? {
                where: {
                  pokemonName: { contains: pokemon, mode: "insensitive" as const },
                  ...(listType === "WANT" || listType === "OFFER" ? { listType: listType as any } : {}),
                },
              }
            : {}),
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const result = traders.map((t) => ({
    id: t.id,
    username: t.username,
    displayName: t.displayName,
    avatarUrl: t.avatarUrl,
    bio: t.bio,
    team: t.team,
    trainerCode: t.trainerCode,
    wantCount: t.pokemonLists.filter((p) => p.listType === "WANT").length,
    offerCount: t.pokemonLists.filter((p) => p.listType === "OFFER").length,
    matchedPokemon: pokemon
      ? t.pokemonLists.map((p) => ({
          pokemonName: p.pokemonName,
          pokemonId: p.pokemonId,
          listType: p.listType,
          isShiny: p.isShiny,
          isMirror: p.isMirror,
          isDynamax: p.isDynamax,
        }))
      : undefined,
  }));

  return NextResponse.json({ traders: result, total, pages: Math.ceil(total / limit) });
}
