import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: "insensitive" as const } },
          { displayName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

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
        _count: {
          select: {
            pokemonLists: true,
          },
        },
        pokemonLists: {
          select: { listType: true },
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
  }));

  return NextResponse.json({ traders: result, total, pages: Math.ceil(total / limit) });
}
