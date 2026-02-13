import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      trainerCode: true,
      trainerCode2: true,
      team: true,
      createdAt: true,
      pokemonLists: {
        orderBy: { pokemonId: "asc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    wantList: user.pokemonLists.filter((p) => p.listType === "WANT"),
    offerList: user.pokemonLists.filter((p) => p.listType === "OFFER"),
    wantCount: user.pokemonLists.filter((p) => p.listType === "WANT").length,
    offerCount: user.pokemonLists.filter((p) => p.listType === "OFFER").length,
  });
}
