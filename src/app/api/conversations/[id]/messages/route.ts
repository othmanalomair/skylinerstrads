import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (
    !conversation ||
    (conversation.user1Id !== session.user.id && conversation.user2Id !== session.user.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      NOT: { senderId: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      senderId: true,
      content: true,
      createdAt: true,
      readAt: true,
    },
  });

  return NextResponse.json(
    messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      readAt: m.readAt?.toISOString() || null,
    }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (
    !conversation ||
    (conversation.user1Id !== session.user.id && conversation.user2Id !== session.user.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: session.user.id,
      content: content.trim(),
    },
  });

  // Update conversation's last message
  await prisma.conversation.update({
    where: { id },
    data: {
      lastMessageText: content.trim().substring(0, 100),
      lastMessageAt: new Date(),
    },
  });

  return NextResponse.json({
    id: message.id,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    readAt: null,
  }, { status: 201 });
}
