import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalPokemon, totalConversations, totalMessages] =
    await Promise.all([
      prisma.user.count(),
      prisma.pokemonList.count(),
      prisma.conversation.count(),
      prisma.message.count(),
    ]);

  return NextResponse.json({
    totalUsers,
    totalPokemon,
    totalConversations,
    totalMessages,
  });
}
