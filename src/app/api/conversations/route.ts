import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: session.user.id },
        { user2Id: session.user.id },
      ],
    },
    include: {
      user1: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, team: true },
      },
      user2: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, team: true },
      },
      messages: {
        where: {
          readAt: null,
          NOT: { senderId: session.user.id },
        },
        select: { id: true },
      },
    },
    orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
  });

  const result = conversations.map((c) => {
    const otherUser = c.user1Id === session.user.id ? c.user2 : c.user1;
    return {
      id: c.id,
      otherUser,
      lastMessageText: c.lastMessageText,
      lastMessageAt: c.lastMessageAt?.toISOString() || null,
      unreadCount: c.messages.length,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();

  if (!userId || userId === session.user.id) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  // Check for existing conversation (in either direction)
  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: session.user.id, user2Id: userId },
        { user1Id: userId, user2Id: session.user.id },
      ],
    },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const conversation = await prisma.conversation.create({
    data: {
      user1Id: session.user.id,
      user2Id: userId,
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
