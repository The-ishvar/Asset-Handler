import { useState, useEffect } from "react";
import { useListConversations } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, X } from "lucide-react";
import { connectSocket } from "@/lib/socket";

function timeLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function Messages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: conversations = [], isLoading } = useListConversations({
    enabled: !!user,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
  });
  const [onlineIds, setOnlineIds] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user.id);
    socket.on("online:list", (ids) => setOnlineIds(ids));
    socket.on("user:online", ({ userId }) => setOnlineIds((prev) => prev.includes(userId) ? prev : [...prev, userId]));
    socket.on("user:offline", ({ userId }) => setOnlineIds((prev) => prev.filter((id) => id !== userId)));
    return () => {
      socket.off("online:list");
      socket.off("user:online");
      socket.off("user:offline");
    };
  }, [user]);

  useEffect(() => { if (!user) setLocation("/login"); }, [user]);
  if (!user) return null;

  const filtered = conversations.filter((c) =>
    !search.trim() || c.userName?.toLowerCase().includes(search.toLowerCase()) || c.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between py-3 mb-2">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" /> Messages
            {totalUnread > 0 && (
              <Badge className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">{totalUnread}</Badge>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search messages…"
          className="pl-9 h-9 text-sm bg-muted/40 border-0 focus-visible:ring-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 p-3.5 rounded-xl">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-3 w-10 mt-1 shrink-0" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
          <MessageCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            {search ? "No conversations found" : "No messages yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "Try a different search" : "Visit a shop and click \"Chat with Shop Owner\" to start messaging"}
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {filtered.map((conv) => {
            const isOnline = onlineIds.includes(conv.userId);
            const hasUnread = conv.unreadCount > 0;
            return (
              <Link key={conv.userId} href={`/messages/${conv.userId}`}>
                <div className={`flex gap-3 p-3.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer ${hasUnread ? "bg-purple-50/60 dark:bg-purple-950/20" : ""}`}>
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conv.userAvatarUrl || ""} />
                      <AvatarFallback className="text-sm bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {(conv.userName || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-background rounded-full transition-colors ${isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                  </div>

                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-sm truncate ${hasUnread ? "font-bold" : "font-semibold"}`}>{conv.userName || "User"}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeLabel(conv.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={`text-sm truncate ${hasUnread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 bg-purple-600 text-white text-[11px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {isOnline && (
                      <p className="text-[11px] text-green-500 font-medium mt-0.5">Online</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
