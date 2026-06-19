import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { logger } from "./logger";

let io: IOServer | null = null;

export function initSocket(httpServer: HttpServer): IOServer {
  io = new IOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socket.io",
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Socket connected");

    // Join a user room for targeted events
    socket.on("join", (userId: string | number) => {
      socket.join(`user:${userId}`);
      logger.info({ socketId: socket.id, userId }, "Socket joined user room");
    });

    // Join a conversation room
    socket.on("join:conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicators
    socket.on("typing:start", ({ conversationId, userId, userName }: { conversationId: string; userId: number; userName: string }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", { userId, userName });
    });

    socket.on("typing:stop", ({ conversationId, userId }: { conversationId: string; userId: number }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", { userId });
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Socket disconnected");
    });
  });

  return io;
}

export function getIO(): IOServer | null {
  return io;
}

export function emitToUser(userId: number, event: string, data: unknown): void {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitToConversation(conversationId: string, event: string, data: unknown): void {
  io?.to(`conversation:${conversationId}`).emit(event, data);
}
