import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useSearch } from "wouter";
import {
  useGetSnapInbox, useGetSnapSent, useSendSnap, useViewSnap, useSearchUsers
} from "@/lib/api";
import { useUpload } from "@/hooks/use-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Camera, Send, Eye, EyeOff, X, Image as ImageIcon,
  Search, Inbox, ArrowLeft, CheckCheck
} from "lucide-react";

function SnapItem({ snap, isInbox, onView }) {
  const [opened, setOpened] = useState(snap.viewed);
  const viewSnap = useViewSnap();

  const handleOpen = () => {
    if (isInbox && !opened) {
      setOpened(true);
      viewSnap.mutate(snap.id);
      onView?.(snap);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
        isInbox && !opened
          ? "bg-primary/5 border-primary/30 shadow-sm hover:bg-primary/10"
          : "bg-card hover:bg-muted/30"
      }`}
      onClick={handleOpen}
    >
      <Avatar className="w-11 h-11 shrink-0">
        <AvatarImage src={isInbox ? snap.senderAvatar || "" : snap.receiverAvatar || ""} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
          {((isInbox ? snap.senderName : snap.receiverName) || "?")[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate">
            {isInbox ? snap.senderName : snap.receiverName}
          </span>
          {isInbox && !opened && (
            <span className="text-[10px] bg-primary text-white rounded-full px-2 py-0.5 font-bold shrink-0">NEW</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {snap.caption ? (
            <span className={opened ? "" : "blur-sm select-none"}>
              {opened ? snap.caption : "Tap to view"}
            </span>
          ) : (
            <span className="italic">{opened ? "📷 Photo snap" : "🔒 Tap to open"}</span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(snap.createdAt), { addSuffix: true })}
        </div>
      </div>

      <div className="shrink-0">
        {isInbox ? (
          opened ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-primary" />
        ) : (
          snap.viewed ? <CheckCheck className="w-4 h-4 text-blue-500" /> : <Eye className="w-4 h-4 text-muted-foreground/40" />
        )}
      </div>
    </div>
  );
}

function SnapViewer({ snap, onClose }) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/20 hover:bg-white/30">
        <X className="w-6 h-6" />
      </button>
      <div className="absolute top-4 left-4 flex items-center gap-2 text-white">
        <Avatar className="w-8 h-8">
          <AvatarImage src={snap.senderAvatar || ""} />
          <AvatarFallback className="text-xs">{(snap.senderName || "?")[0]}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm">{snap.senderName}</span>
      </div>

      {snap.mediaUrl ? (
        snap.mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
          <video src={snap.mediaUrl} className="max-w-full max-h-[80vh] rounded-xl" controls autoPlay />
        ) : (
          <img src={snap.mediaUrl} alt="Snap" className="max-w-full max-h-[80vh] rounded-xl object-contain" />
        )
      ) : null}

      {snap.caption && (
        <div className="absolute bottom-12 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-4 text-white text-center">
          {snap.caption}
        </div>
      )}
    </div>
  );
}

export default function SnapsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const preselectedId = params.get("to");
  const preselectedName = params.get("name");
  const { toast } = useToast();

  const [tab, setTab] = useState("inbox");
  const [showSend, setShowSend] = useState(!!preselectedId);
  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedUser, setSelectedUser] = useState(
    preselectedId ? { id: Number(preselectedId), name: preselectedName || "" } : null
  );
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [viewingSnap, setViewingSnap] = useState(null);
  const fileInputRef = useRef(null);

  const { data: inbox, refetch: refetchInbox } = useGetSnapInbox({ enabled: !!user });
  const { data: sent, refetch: refetchSent } = useGetSnapSent({ enabled: !!user });
  const sendSnap = useSendSnap();

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (r) => { setMediaUrl(r.objectUrl); setPreviewUrl(r.objectUrl); },
    onError: () => toast({ title: "Upload failed", variant: "destructive" }),
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ), 400);
    return () => clearTimeout(t);
  }, [searchQ]);

  const { data: searchResults } = useSearchUsers(debouncedQ, { enabled: debouncedQ.length >= 2 });

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Camera className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Snaps</h2>
        <p className="text-muted-foreground mb-6">Snap bhejne ke liye login karein</p>
        <Link href="/login"><Button>Login Karein</Button></Link>
      </div>
    );
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast({ title: "File 20MB se chhoti honi chahiye", variant: "destructive" }); return; }
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    await uploadFile(file);
  };

  const handleSend = () => {
    if (!selectedUser) { toast({ title: "Pehle user chunein", variant: "destructive" }); return; }
    if (!mediaUrl && !caption.trim()) { toast({ title: "Photo ya caption zaroor add karein", variant: "destructive" }); return; }
    sendSnap.mutate(
      { receiverId: selectedUser.id, mediaUrl: mediaUrl || undefined, caption: caption || undefined },
      {
        onSuccess: () => {
          toast({ title: `Snap bhej diya ${selectedUser.name} ko! 📸` });
          setShowSend(false);
          setSelectedUser(null);
          setCaption("");
          setMediaUrl(null);
          setPreviewUrl(null);
          refetchSent();
        },
        onError: (err) => toast({ title: "Snap nahi bheja", description: err.message, variant: "destructive" }),
      }
    );
  };

  const unreadCount = inbox?.filter((s) => !s.viewed).length ?? 0;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="w-7 h-7 text-purple-500" />
          <h1 className="text-2xl font-bold">Snaps</h1>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-0.5">{unreadCount}</span>
          )}
        </div>
        <Button onClick={() => setShowSend(true)} size="sm" className="bg-purple-600 hover:bg-purple-700">
          <Camera className="w-4 h-4 mr-2" /> Snap Bhejein
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        <button
          onClick={() => setTab("inbox")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "inbox" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Inbox className="w-4 h-4" /> Inbox
          {unreadCount > 0 && <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>}
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "sent" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Send className="w-4 h-4" /> Sent
        </button>
      </div>

      {/* Snap list */}
      {tab === "inbox" && (
        <div className="space-y-2">
          {!inbox ? (
            [1,2,3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          ) : inbox.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">Koi snap nahi aaya abhi</p>
              <p className="text-xs text-muted-foreground mt-1">Doston ko snap bhejein!</p>
            </div>
          ) : (
            inbox.map((snap) => (
              <SnapItem key={snap.id} snap={snap} isInbox={true} onView={(s) => setViewingSnap(s)} />
            ))
          )}
        </div>
      )}

      {tab === "sent" && (
        <div className="space-y-2">
          {!sent ? (
            [1,2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          ) : sent.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <Send className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">Abhi koi snap nahi bheja</p>
            </div>
          ) : (
            sent.map((snap) => (
              <SnapItem key={snap.id} snap={snap} isInbox={false} />
            ))
          )}
        </div>
      )}

      {/* Send snap modal */}
      {showSend && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
              <h2 className="text-lg font-bold">Snap Bhejein 📸</h2>
              <button onClick={() => { setShowSend(false); setSelectedUser(null); }} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* User selector */}
              {!selectedUser ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Kisi ka naam ya phone dhoondein..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} autoFocus />
                  </div>
                  {debouncedQ.length >= 2 && (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {searchResults?.filter((u) => u.id !== user.id).map((u) => (
                        <button key={u.id} onClick={() => { setSelectedUser(u); setSearchQ(""); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left">
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarImage src={u.avatarUrl || ""} />
                            <AvatarFallback className="text-sm bg-primary/10 text-primary">{u.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm">{u.name}</div>
                            {u.phone && <div className="text-xs text-muted-foreground">{u.phone}</div>}
                          </div>
                        </button>
                      ))}
                      {searchResults?.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Koi user nahi mila</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-primary/5 rounded-xl px-4 py-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={selectedUser.avatarUrl || ""} />
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">{selectedUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold flex-1">{selectedUser.name}</span>
                  <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                </div>
              )}

              {/* Media */}
              <div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                {!previewUrl ? (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-muted-foreground/30 rounded-2xl py-8 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-purple-500" />
                    </div>
                    <span className="text-sm font-medium">{isUploading ? "Upload ho raha hai..." : "Photo ya Video add karein"}</span>
                    <span className="text-xs text-muted-foreground">Optional — Caption bhi bhej sakte ho</span>
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                    {previewUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
                      <video src={previewUrl} className="w-full h-full object-contain" controls />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    )}
                    <button onClick={() => { setMediaUrl(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Caption */}
              <Textarea
                placeholder="Caption likhein (optional)..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="resize-none"
              />

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleSend}
                disabled={sendSnap.isPending || isUploading || !selectedUser}
              >
                <Send className="w-4 h-4 mr-2" />
                {sendSnap.isPending ? "Bhej raha hai..." : "Snap Bhejein"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Snap viewer */}
      {viewingSnap && <SnapViewer snap={viewingSnap} onClose={() => setViewingSnap(null)} />}
    </div>
  );
}
