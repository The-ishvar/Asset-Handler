import { useState, useRef, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetConversation, useSendMessage, useGetUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, connectSocket } from "@/lib/socket";

export default function Conversation() {
  const [, params] = useRoute("/messages/:userId");
  const otherId = Number(params?.userId);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const [isOtherOnline, setIsOtherOnline] = useState(false);

  const { data: messages, isLoading } = useGetConversation(otherId, { enabled: !!user && !!otherId, refetchInterval: 5000 });
  const { data: otherUser } = useGetUser(otherId, { enabled: !!otherId });
  const sendMsg = useSendMessage();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Socket.IO: connect, track online status, read receipts
  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user.id);

    // Get current online list
    socket.on("online:list", (onlineIds) => {
      setIsOtherOnline(onlineIds.includes(otherId));
    });

    socket.on("user:online", ({ userId }) => {
      if (userId === otherId) setIsOtherOnline(true);
    });

    socket.on("user:offline", ({ userId }) => {
      if (userId === otherId) setIsOtherOnline(false);
    });

    // Real-time new message from other person
    socket.on("message:new", (msg) => {
      if (msg.senderId === otherId) {
        qc.invalidateQueries({ queryKey: ["getConversation", otherId] });
        qc.invalidateQueries({ queryKey: ["listConversations"] });
      }
    });

    // Other person read our messages
    socket.on("message:read", ({ readBy }) => {
      if (readBy === otherId) {
        qc.invalidateQueries({ queryKey: ["getConversation", otherId] });
      }
    });

    return () => {
      socket.off("online:list");
      socket.off("user:online");
      socket.off("user:offline");
      socket.off("message:new");
      socket.off("message:read");
    };
  }, [user, otherId, qc]);

  if (!user) { setLocation("/login"); return null; }

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMsg.mutate(
      { receiverId: otherId, content: text },
      { onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["getConversation", otherId] }); } }
    );
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 56px - 64px)" }}>
      <div className="flex items-center gap-3 py-3 border-b shrink-0">
        <Link href="/messages"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div className="relative">
          <Avatar className="w-9 h-9">
            <AvatarImage src={otherUser?.avatarUrl || ""} />
            <AvatarFallback>{(otherUser?.name || "?").charAt(0)}</AvatarFallback>
          </Avatar>
          {isOtherOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>
        <div>
          <div className="font-semibold text-sm">{otherUser?.name || "User"}</div>
          <div className="text-xs text-muted-foreground">
            {isOtherOnline ? (
              <span className="text-green-500 font-medium">Online</span>
            ) : (
              otherUser?.phone || ""
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : !messages?.length ? (
          <div className="text-center py-10 text-muted-foreground"><p className="text-sm">No messages yet. Say hello!</p></div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                  <p>{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className={`text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMe && (
                      msg.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-primary-foreground/60" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t shrink-0">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." className="flex-1" />
        <Button type="submit" size="icon" disabled={sendMsg.isPending || !text.trim()}><Send className="w-4 h-4" /></Button>
      </form>
    </div>
  );
}
