import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      bio: true,
      trainerCode: true,
      team: true,
      username: true,
      email: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { displayName, bio, trainerCode, team } = await req.json();

  const validTeams = ["MYSTIC", "VALOR", "INSTINCT", ""];
  if (team !== undefined && !validTeams.includes(team)) {
    return NextResponse.json({ error: "Invalid team" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: displayName || null,
      bio: bio || null,
      trainerCode: trainerCode || null,
      team: team || null,
    },
  });

  return NextResponse.json({ success: true });
}
