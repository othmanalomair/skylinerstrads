import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("join-conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("send-message", (data: {
      conversationId: string;
      message: {
        id: string;
        senderId: string;
        content: string;
        createdAt: string;
        readAt: string | null;
      };
      recipientId: string;
    }) => {
      // Broadcast to conversation room
      socket.to(`conversation:${data.conversationId}`).emit("new-message", data.message);
      // Notify recipient for conversation list update
      io.to(`user:${data.recipientId}`).emit("conversation-updated", {
        conversationId: data.conversationId,
        lastMessageText: data.message.content,
        lastMessageAt: data.message.createdAt,
      });
    });

    socket.on("typing", (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user-typing", data.userId);
    });

    socket.on("stop-typing", (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user-stop-typing", data.userId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
