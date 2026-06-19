import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { logger } from "./logger";

let io: IOServer | null = null;

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map<number, Set<string>>();

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
    let joinedUserId: number | null = null;

    // Join a user room for targeted events
    socket.on("join", (userId: string | number) => {
      const uid = Number(userId);
      joinedUserId = uid;
      socket.join(`user:${uid}`);
      logger.info({ socketId: socket.id, userId: uid }, "Socket joined user room");

      // Track online
      if (!onlineUsers.has(uid)) onlineUsers.set(uid, new Set());
      onlineUsers.get(uid)!.add(socket.id);

      // Broadcast to everyone that this user is online
      io!.emit("user:online", { userId: uid });

      // Send current online list to this new socket
      socket.emit("online:list", Array.from(onlineUsers.keys()));
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
      if (joinedUserId !== null) {
        const sockets = onlineUsers.get(joinedUserId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(joinedUserId);
            // Broadcast offline
            io!.emit("user:offline", { userId: joinedUserId });
          }
        }
      }
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

export function isUserOnline(userId: number): boolean {
  return onlineUsers.has(userId) && (onlineUsers.get(userId)?.size ?? 0) > 0;
}

export function getOnlineUserIds(): number[] {
  return Array.from(onlineUsers.keys());
}
