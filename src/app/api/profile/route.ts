import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        displayName: true,
        avatarUrl: true,
        bio: true,
        trainerCode: true,
        trainerCode2: true,
        team: true,
        username: true,
        email: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { displayName, bio, trainerCode, trainerCode2, team } = await req.json();

  const validTeams = ["MYSTIC", "VALOR", "INSTINCT", ""];
  if (team !== undefined && !validTeams.includes(team)) {
    return NextResponse.json({ error: "Invalid team" }, { status: 400 });
  }

  if (!trainerCode) {
    return NextResponse.json({ error: "Trainer code is required" }, { status: 400 });
  }

  // Check uniqueness if trainer code changed
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { trainerCode: true },
  });

  if (currentUser && currentUser.trainerCode !== trainerCode) {
    const existing = await prisma.user.findUnique({
      where: { trainerCode },
    });
    if (existing) {
      return NextResponse.json({ error: "Trainer code already taken" }, { status: 409 });
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: displayName || null,
      bio: bio || null,
      trainerCode,
      trainerCode2: trainerCode2 || null,
      team: team || null,
    },
  });

  return NextResponse.json({ success: true });
}
