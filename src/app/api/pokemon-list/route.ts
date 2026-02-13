import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lists = await prisma.pokemonList.findMany({
    where: { userId: session.user.id },
    orderBy: { pokemonId: "asc" },
  });

  return NextResponse.json(lists);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pokemonId, pokemonName, listType, isShiny, isShadow, isLucky, notes } = await req.json();

  if (!pokemonId || !pokemonName || !listType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["WANT", "OFFER"].includes(listType)) {
    return NextResponse.json({ error: "Invalid list type" }, { status: 400 });
  }

  try {
    const entry = await prisma.pokemonList.create({
      data: {
        userId: session.user.id,
        pokemonId,
        pokemonName,
        listType,
        isShiny: isShiny || false,
        isShadow: isShadow || false,
        isLucky: isLucky || false,
        notes: notes || null,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Pokemon already in this list with these tags" }, { status: 409 });
    }
    throw error;
  }
}
