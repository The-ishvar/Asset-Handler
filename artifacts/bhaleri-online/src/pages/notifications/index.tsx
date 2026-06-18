import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Heart, MessageCircle, UserPlus, ShoppingBag, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const typeIcon: Record<string, React.ReactNode> = {
  follow: <UserPlus className="w-4 h-4 text-blue-500" />,
  like: <Heart className="w-4 h-4 text-red-500" />,
  comment: <MessageCircle className="w-4 h-4 text-green-500" />,
  message: <MessageCircle className="w-4 h-4 text-purple-500" />,
  listing: <ShoppingBag className="w-4 h-4 text-orange-500" />,
};

export default function Notifications() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: notifications, isLoading } = useListNotifications({ query: { enabled: !!user, refetchInterval: 30000 } });
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const handleMarkAll = () => {
    markAll.mutate(undefined as any, { onSuccess: () => qc.invalidateQueries({ queryKey: ["listNotifications"] }) });
  };

  const handleClickNotif = (id: number, isRead: boolean, link?: string | null) => {
    if (!isRead) {
      markOne.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: ["listNotifications"] }) });
    }
    if (link) setLocation(link);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAll} disabled={markAll.isPending}>
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 p-4 border rounded-xl">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : !notifications?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">When people interact with you, you'll see it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <button
              key={n.id}
              onClick={() => handleClickNotif(n.id, n.isRead, n.link)}
              className={`w-full flex gap-3 p-4 rounded-xl border text-left transition-colors hover:bg-muted/50 ${
                !n.isRead ? "bg-primary/5 border-primary/20" : "bg-background"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={n.fromUserAvatar || ""} />
                  <AvatarFallback className="text-sm">
                    {(n.fromUserName || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                  {typeIcon[n.type] || <Bell className="w-4 h-4" />}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
