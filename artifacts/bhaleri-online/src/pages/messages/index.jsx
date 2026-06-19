import { useState, useEffect } from "react";
import { useListConversations } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import { connectSocket } from "@/lib/socket";

export default function Messages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: conversations, isLoading } = useListConversations({ enabled: !!user, refetchInterval: 15000, refetchIntervalInBackground: false });
  const [onlineIds, setOnlineIds] = useState([]);

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

  if (!user) { setLocation("/login"); return null; }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2"><MessageCircle className="w-6 h-6" /> Messages</h1>
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="flex gap-3 p-4 border rounded-xl">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-2/3" /></div>
            </div>
          ))}
        </div>
      ) : !conversations?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <MessageCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start chatting by visiting a seller's listing and clicking "Message Seller".</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const isOnline = onlineIds.includes(conv.userId);
            return (
              <Link key={conv.userId} href={`/messages/${conv.userId}`}>
                <div className="flex gap-3 p-4 border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conv.userAvatarUrl || ""} />
                      <AvatarFallback>{(conv.userName || "?").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{conv.userName}</span>
                        {isOnline && <span className="text-xs text-green-500 font-medium">• Online</span>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {conv.unreadCount > 0 && <Badge className="bg-primary text-primary-foreground text-xs">{conv.unreadCount}</Badge>}
                        <span className="text-xs text-muted-foreground">{new Date(conv.lastMessageAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                    <p className={`text-sm mt-0.5 truncate ${conv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{conv.lastMessage}</p>
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
