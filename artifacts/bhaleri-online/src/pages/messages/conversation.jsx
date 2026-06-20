import { useState, useRef, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetConversation, useSendMessage, useGetUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Check, CheckCheck, Smile, Paperclip, Phone } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, connectSocket } from "@/lib/socket";

const EMOJI_LIST = ["😊","😂","❤️","👍","🙏","😍","🎉","🔥","✅","💯","😢","😎","🤔","👋","💪","🙌","😁","🥰","😜","🤝"];

function timeLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function dateSeparator(iso) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  for (const msg of messages) {
    const d = new Date(msg.createdAt).toDateString();
    if (d !== lastDate) {
      groups.push({ type: "separator", label: dateSeparator(msg.createdAt), key: `sep-${msg.id}` });
      lastDate = d;
    }
    groups.push({ type: "message", msg, key: `msg-${msg.id}` });
  }
  return groups;
}

export default function Conversation() {
  const [, params] = useRoute("/messages/:userId");
  const otherId = Number(params?.userId);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimer = useRef(null);

  const { data: messages = [], isLoading } = useGetConversation(otherId, {
    enabled: !!user && !!otherId,
    refetchInterval: 8000,
  });
  const { data: otherUser } = useGetUser(otherId, { enabled: !!otherId });
  const sendMsg = useSendMessage();

  const groups = groupByDate(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user.id);
    const conversationId = [user.id, otherId].sort((a, b) => a - b).join("-");

    socket.emit("join:conversation", conversationId);

    socket.on("online:list", (ids) => setIsOtherOnline(ids.includes(otherId)));
    socket.on("user:online", ({ userId }) => { if (userId === otherId) setIsOtherOnline(true); });
    socket.on("user:offline", ({ userId }) => { if (userId === otherId) setIsOtherOnline(false); });

    socket.on("message:new", (msg) => {
      if (msg.senderId === otherId) {
        qc.invalidateQueries({ queryKey: ["getConversation", otherId] });
        qc.invalidateQueries({ queryKey: ["listConversations"] });
      }
    });

    socket.on("message:read", ({ readBy }) => {
      if (readBy === otherId) qc.invalidateQueries({ queryKey: ["getConversation", otherId] });
    });

    socket.on("typing:start", ({ userId }) => {
      if (userId === otherId) setIsOtherTyping(true);
    });
    socket.on("typing:stop", ({ userId }) => {
      if (userId === otherId) setIsOtherTyping(false);
    });

    return () => {
      socket.emit("leave:conversation", conversationId);
      socket.off("online:list");
      socket.off("user:online");
      socket.off("user:offline");
      socket.off("message:new");
      socket.off("message:read");
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [user, otherId, qc]);

  const handleTyping = useCallback(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;
    const conversationId = [user.id, otherId].sort((a, b) => a - b).join("-");
    socket.emit("typing:start", { conversationId, userId: user.id, userName: user.name });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId, userId: user.id });
    }, 2000);
  }, [user, otherId]);

  if (!user) { setLocation("/login"); return null; }

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    const socket = getSocket();
    if (socket && user) {
      const conversationId = [user.id, otherId].sort((a, b) => a - b).join("-");
      socket.emit("typing:stop", { conversationId, userId: user.id });
    }
    sendMsg.mutate(
      { receiverId: otherId, content: text.trim() },
      {
        onSuccess: () => {
          setText("");
          setShowEmoji(false);
          qc.invalidateQueries({ queryKey: ["getConversation", otherId] });
          qc.invalidateQueries({ queryKey: ["listConversations"] });
        }
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100svh - 56px - 64px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b bg-card shrink-0 shadow-sm">
        <Link href="/messages">
          <button className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="relative">
          <Avatar className="w-9 h-9">
            <AvatarImage src={otherUser?.avatarUrl || ""} />
            <AvatarFallback className="text-sm bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              {(otherUser?.name || "?").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-background rounded-full ${isOtherOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{otherUser?.name || "User"}</p>
          <p className="text-xs truncate">
            {isOtherOnline ? (
              <span className="text-green-500 font-medium">Online</span>
            ) : isOtherTyping ? (
              <span className="text-purple-500 italic">typing…</span>
            ) : (
              <span className="text-muted-foreground">{otherUser?.phone ? otherUser.phone : "Last seen recently"}</span>
            )}
          </p>
        </div>
        {otherUser?.phone && (
          <a href={`tel:${otherUser.phone}`} className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
        style={{ background: "var(--chat-bg, transparent)" }}
        onClick={() => setShowEmoji(false)}
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48 rounded-br-sm" : "w-40 rounded-bl-sm"}`} />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={otherUser?.avatarUrl || ""} />
                  <AvatarFallback className="text-lg bg-purple-200 text-purple-700">{(otherUser?.name || "?").charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <p className="font-semibold text-sm">{otherUser?.name || "User"}</p>
              <p className="text-xs text-muted-foreground mt-1">Say hello! 👋</p>
            </div>
          </div>
        ) : (
          <>
            {groups.map((item) => {
              if (item.type === "separator") {
                return (
                  <div key={item.key} className="flex items-center justify-center py-2">
                    <span className="text-[11px] bg-muted/70 text-muted-foreground px-3 py-0.5 rounded-full">{item.label}</span>
                  </div>
                );
              }
              const { msg } = item;
              const isMe = msg.senderId === user.id;
              return (
                <div key={item.key} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-0.5`}>
                  <div className={`max-w-[78%] px-3.5 py-2 text-sm shadow-sm ${
                    isMe
                      ? "bg-purple-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-card border rounded-2xl rounded-bl-sm"
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                      <span className={`text-[10px] ${isMe ? "text-purple-200" : "text-muted-foreground"}`}>
                        {timeLabel(msg.createdAt)}
                      </span>
                      {isMe && (
                        msg.isRead
                          ? <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                          : <Check className="w-3.5 h-3.5 text-purple-200" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isOtherTyping && (
              <div className="flex justify-start mb-0.5">
                <div className="bg-card border rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="border-t bg-card px-3 py-2 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { setText((t) => t + emoji); inputRef.current?.focus(); }}
                className="text-xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-end gap-2 px-3 py-2.5 border-t bg-card shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowEmoji((v) => !v); }}
          className={`p-2 rounded-full transition-colors shrink-0 ${showEmoji ? "bg-purple-100 text-purple-600 dark:bg-purple-900/40" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          <Smile className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="w-full resize-none bg-muted/40 border rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 max-h-32 overflow-y-auto leading-relaxed"
            style={{ minHeight: "42px" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={sendMsg.isPending || !text.trim()}
          className={`p-2.5 rounded-full transition-all shrink-0 ${
            text.trim()
              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
