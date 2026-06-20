import { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useSearch } from "wouter";
import {
  useGetSnapInbox, useGetSnapSent, useSendSnap, useSendSnapBulk,
  useViewSnap, useSearchUsers, useGetMyFollowing
} from "@/lib/api";
import { connectSocket, getSocket } from "@/lib/socket";
import { useUpload } from "@/hooks/use-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Camera, Send, Eye, EyeOff, X, Inbox, CheckCheck,
  Square, Circle, Check, Video, Loader2, Search, Users, Trash2
} from "lucide-react";

// ─── Snap item in list ─────────────────────────────────────────────────────────
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
            <span className="italic">{opened ? "🎥 Video snap" : "🔒 Tap to open"}</span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(snap.createdAt), { addSuffix: true })}
        </div>
      </div>
      <div className="shrink-0">
        {isInbox
          ? opened ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-primary" />
          : snap.deletedFromInbox
            ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 rounded-full px-2 py-0.5 whitespace-nowrap">
                <Trash2 className="w-3 h-3" /> Seen & deleted
              </span>
            )
            : snap.viewed
              ? <CheckCheck className="w-4 h-4 text-blue-500" />
              : <Eye className="w-4 h-4 text-muted-foreground/40" />
        }
      </div>
    </div>
  );
}

// ─── Full-screen snap viewer ───────────────────────────────────────────────────
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
      {snap.mediaUrl && (
        snap.mediaUrl.match(/\.(mp4|mov|avi|webm)|\/objects\//i) ? (
          <video src={snap.mediaUrl} className="max-w-full max-h-[80vh] rounded-xl" controls autoPlay />
        ) : (
          <img src={snap.mediaUrl} alt="Snap" className="max-w-full max-h-[80vh] rounded-xl object-contain" />
        )
      )}
      {snap.caption && (
        <div className="absolute bottom-12 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-4 text-white text-center">
          {snap.caption}
        </div>
      )}
    </div>
  );
}

// ─── Camera recorder modal ─────────────────────────────────────────────────────
const MAX_SECONDS = 60;

function CameraRecorder({ onVideoReady, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const { toast } = useToast();

  const [phase, setPhase] = useState("idle"); // idle | recording | preview
  const [countdown, setCountdown] = useState(MAX_SECONDS);
  const [blobUrl, setBlobUrl] = useState(null);
  const [blobData, setBlobData] = useState(null);
  const [cameraErr, setCameraErr] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCameraErr("Camera access nahi mila. Browser settings mein allow karein.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopStream();
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    clearInterval(timerRef.current);
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setBlobData(blob);
      setPhase("preview");
      stopStream();
    };
    recorder.start(100);
    setPhase("recording");
    setCountdown(MAX_SECONDS);

    let secs = MAX_SECONDS;
    timerRef.current = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) stopRecording();
    }, 1000);
  }

  function stopRecording() {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function retake() {
    setBlobUrl(null);
    setBlobData(null);
    setPhase("idle");
    startCamera();
  }

  function useVideo() {
    if (blobData) {
      const file = new File([blobData], `snap-${Date.now()}.webm`, { type: "video/webm" });
      onVideoReady(file, blobUrl);
    }
  }

  if (cameraErr) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center gap-4 p-6 text-white">
        <Camera className="w-16 h-16 text-white/30" />
        <p className="text-center text-white/80">{cameraErr}</p>
        <Button variant="outline" onClick={onClose} className="text-white border-white/40">Wapas Jao</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Close */}
      <button onClick={() => { stopStream(); onClose(); }} className="absolute top-4 right-4 z-10 text-white bg-white/20 p-2 rounded-full">
        <X className="w-5 h-5" />
      </button>

      {/* Live / preview */}
      {phase !== "preview" ? (
        <video ref={videoRef} muted playsInline className="flex-1 w-full object-cover" />
      ) : (
        <video src={blobUrl} controls playsInline className="flex-1 w-full object-cover" />
      )}

      {/* Countdown bar */}
      {phase === "recording" && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-red-500 transition-all"
            style={{ width: `${(countdown / MAX_SECONDS) * 100}%` }}
          />
        </div>
      )}
      {phase === "recording" && (
        <div className="absolute top-3 left-4 text-white text-sm font-bold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          {countdown}s
        </div>
      )}

      {/* Controls */}
      <div className="p-6 flex items-center justify-center gap-6 bg-black/60">
        {phase === "idle" && (
          <button onClick={startRecording} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-lg">
            <Circle className="w-8 h-8 text-white fill-white" />
          </button>
        )}
        {phase === "recording" && (
          <button onClick={stopRecording} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-lg">
            <Square className="w-8 h-8 text-white fill-white" />
          </button>
        )}
        {phase === "preview" && (
          <div className="flex gap-4">
            <Button variant="outline" onClick={retake} className="text-white border-white/40">
              Dobara Lo
            </Button>
            <Button onClick={useVideo} className="bg-purple-600 hover:bg-purple-700">
              <Check className="w-4 h-4 mr-2" /> Is Video Ko Use Karo
            </Button>
          </div>
        )}
      </div>

      {phase === "idle" && (
        <p className="text-white/60 text-xs text-center pb-3">
          Red button dabao — max {MAX_SECONDS} second
        </p>
      )}
    </div>
  );
}

// ─── Send Snap Modal ───────────────────────────────────────────────────────────
function SendSnapModal({ onClose, preselectedId, preselectedName }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: following = [], isLoading: followingLoading } = useGetMyFollowing({ enabled: !!user });
  const sendBulk = useSendSnapBulk();
  const { uploadFile, isUploading } = useUpload();

  const [step, setStep] = useState("record"); // record | recipients
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [selected, setSelected] = useState(() =>
    preselectedId ? new Set([Number(preselectedId)]) : new Set()
  );
  const [searchQ, setSearchQ] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ), 350);
    return () => clearTimeout(t);
  }, [searchQ]);
  const { data: searchResults } = useSearchUsers(debouncedQ, { enabled: debouncedQ.length >= 2 });

  function handleVideoReady(file, url) {
    setMediaFile(file);
    setPreviewUrl(url);
    setShowCamera(false);
    setStep("recipients");
  }

  function toggleUser(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSend() {
    if (selected.size === 0) { toast({ title: "Kam se kam ek dost chunein", variant: "destructive" }); return; }
    if (!mediaFile && !caption.trim()) { toast({ title: "Video ya caption add karein", variant: "destructive" }); return; }

    let mediaUrl;
    if (mediaFile) {
      const result = await uploadFile(mediaFile);
      if (!result) { toast({ title: "Upload fail hua", variant: "destructive" }); return; }
      mediaUrl = result.objectUrl;
    }

    sendBulk.mutate(
      { receiverIds: Array.from(selected), mediaUrl, caption: caption.trim() || undefined },
      {
        onSuccess: (data) => {
          toast({ title: `Snap bhej diya ${data.sent} dosto ko! 🎥` });
          onClose();
        },
        onError: (err) => toast({ title: "Snap nahi bheja", description: err.message, variant: "destructive" }),
      }
    );
  }

  const displayList = debouncedQ.length >= 2
    ? (searchResults || []).filter((u) => u.id !== user?.id)
    : following.filter((u) => u && u.id);

  return (
    <>
      {showCamera && (
        <CameraRecorder onVideoReady={handleVideoReady} onClose={() => setShowCamera(false)} />
      )}

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b shrink-0">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-500" /> Video Snap Bhejein
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Step 1: Video recording */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">📹 Video</p>
              {!previewUrl ? (
                <button
                  onClick={() => setShowCamera(true)}
                  className="w-full border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-2xl py-10 flex flex-col items-center gap-3 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                >
                  <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                    <Camera className="w-7 h-7 text-purple-500" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">Camera se video banao</div>
                    <div className="text-xs text-muted-foreground">Max {MAX_SECONDS} second</div>
                  </div>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                  <video src={previewUrl} className="w-full h-full object-contain" controls />
                  <button
                    onClick={() => { setPreviewUrl(null); setMediaFile(null); }}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowCamera(true)}
                    className="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded-full px-3 py-1"
                  >
                    Dobara Lo
                  </button>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">💬 Caption (optional)</p>
              <Textarea
                placeholder="Kuch likhna chahte ho?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Recipients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Kisko Bhejein
                  {selected.size > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{selected.size}</span>
                  )}
                </p>
                {selected.size > 0 && (
                  <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground">Sab hatao</button>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9 text-sm"
                  placeholder="Kisi aur ko dhoondein..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                />
              </div>

              {/* User list */}
              <div className="max-h-52 overflow-y-auto space-y-1 rounded-xl border p-1">
                {followingLoading && !debouncedQ ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">Load ho raha hai…</div>
                ) : displayList.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {debouncedQ.length >= 2 ? "Koi user nahi mila" : "Pehle kisi ko follow karein"}
                  </div>
                ) : (
                  displayList.map((u) => {
                    const isChecked = selected.has(u.id);
                    return (
                      <button
                        key={u.id}
                        onClick={() => toggleUser(u.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                          isChecked ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/60"
                        }`}
                      >
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarImage src={u.avatarUrl || ""} />
                          <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
                            {(u.name || "?")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 font-medium text-sm truncate">{u.name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? "bg-primary border-primary" : "border-muted-foreground/30"
                        }`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Send button */}
          <div className="p-4 border-t shrink-0">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base"
              onClick={handleSend}
              disabled={sendBulk.isPending || isUploading || selected.size === 0}
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upload ho raha hai…</>
              ) : sendBulk.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Bhej raha hai…</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> {selected.size > 0 ? `${selected.size} dost ko bhejein` : "Bhejein"}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main snaps page ───────────────────────────────────────────────────────────
export default function SnapsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const preselectedId = params.get("to");
  const preselectedName = params.get("name");

  const [tab, setTab] = useState("inbox");
  const [showSend, setShowSend] = useState(!!preselectedId);
  const [viewingSnap, setViewingSnap] = useState(null);

  const { data: inbox } = useGetSnapInbox({ enabled: !!user });
  const { data: sent } = useGetSnapSent({ enabled: !!user });

  // Real-time: listen for new_snap events via Socket.IO
  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user.id);

    const handleNewSnap = () => {
      qc.invalidateQueries({ queryKey: ["snapInbox"] });
    };

    socket.on("new_snap", handleNewSnap);
    return () => {
      socket.off("new_snap", handleNewSnap);
    };
  }, [user, qc]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Camera className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Snaps</h2>
        <p className="text-muted-foreground mb-6">Video snap bhejne ke liye login karein</p>
        <Link href="/login"><Button>Login Karein</Button></Link>
      </div>
    );
  }

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
          <Video className="w-4 h-4 mr-2" /> Video Snap
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        <button
          onClick={() => setTab("inbox")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "inbox" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Inbox className="w-4 h-4" /> Inbox
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>
          )}
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "sent" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Send className="w-4 h-4" /> Sent
        </button>
      </div>

      {/* Snap lists */}
      {tab === "inbox" && (
        <div className="space-y-2">
          {!inbox ? (
            [1,2,3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          ) : inbox.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">Koi snap nahi aaya abhi</p>
              <p className="text-xs text-muted-foreground mt-1">Doston ko video snap bhejein!</p>
            </div>
          ) : inbox.map((snap) => (
            <SnapItem key={snap.id} snap={snap} isInbox={true} onView={(s) => setViewingSnap(s)} />
          ))}
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
          ) : sent.map((snap) => (
            <SnapItem key={snap.id} snap={snap} isInbox={false} />
          ))}
        </div>
      )}

      {/* Send modal */}
      {showSend && (
        <SendSnapModal
          onClose={() => setShowSend(false)}
          preselectedId={preselectedId}
          preselectedName={preselectedName}
        />
      )}

      {/* Viewer */}
      {viewingSnap && <SnapViewer snap={viewingSnap} onClose={() => setViewingSnap(null)} />}
    </div>
  );
}
