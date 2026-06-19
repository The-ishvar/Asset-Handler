import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(window.location.origin, {
      path: "/api/socket.io",
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(userId) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit("join", userId);
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
