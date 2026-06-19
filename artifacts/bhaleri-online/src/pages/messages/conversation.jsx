import { useState, useRef, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetConversation, useSendMessage, useGetUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

export default function Conversation() {
  const [, params] = useRoute("/messages/:userId");
  const otherId = Number(params?.userId);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const { data: messages, isLoading } = useGetConversation(otherId, { enabled: !!user && !!otherId, refetchInterval: 5000 });
  const { data: otherUser } = useGetUser(otherId, { enabled: !!otherId });
  const sendMsg = useSendMessage();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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
        <Avatar className="w-9 h-9">
          <AvatarImage src={otherUser?.avatarUrl || ""} />
          <AvatarFallback>{(otherUser?.name || "?").charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-sm">{otherUser?.name || "User"}</div>
          <div className="text-xs text-muted-foreground">{otherUser?.phone || ""}</div>
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
                  <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
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
