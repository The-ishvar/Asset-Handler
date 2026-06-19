import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useListReels, useToggleReelLike, useRecordReelView, useListReelComments, useAddReelComment } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Eye, Plus, Volume2, VolumeX, Send, X, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

function ReelCard({ reel, isActive }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(reel.isLiked);
  const [likeCount, setLikeCount] = useState(reel.likeCount);
  const viewRecordedRef = useRef(false);

  const toggleLike = useToggleReelLike();
  const recordView = useRecordReelView();
  const { data: comments } = useListReelComments(reel.id, { enabled: showComments });
  const addComment = useAddReelComment();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      if (!viewRecordedRef.current) { recordView.mutate({ id: reel.id }); viewRecordedRef.current = true; }
    } else {
      video.pause(); setPlaying(false);
    }
  }, [isActive, recordView, reel.id]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) { video.pause(); setPlaying(false); } else { video.play(); setPlaying(true); }
  };

  const handleLike = () => {
    if (!user) { toast({ title: "Login to like reels", variant: "destructive" }); return; }
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    toggleLike.mutate({ id: reel.id }, {
      onSuccess: (d) => { setLiked(d.liked); setLikeCount(d.likeCount); },
      onError: () => { setLiked(liked); setLikeCount(likeCount); },
    });
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!user) { toast({ title: "Login to comment", variant: "destructive" }); return; }
    if (!commentText.trim()) return;
    addComment.mutate({ id: reel.id, data: { content: commentText } }, {
      onSuccess: () => { setCommentText(""); qc.invalidateQueries({ queryKey: ["listReelComments", reel.id] }); },
    });
  };

  const isYouTube = reel.videoUrl.includes("youtube.com") || reel.videoUrl.includes("youtu.be");

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center select-none">
      {isYouTube ? (
        <iframe
          src={reel.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/") + "?autoplay=1&mute=1&loop=1"}
          className="w-full h-full object-contain"
          allow="autoplay"
          title={reel.title}
        />
      ) : (
        <video ref={videoRef} src={reel.videoUrl} className="w-full h-full object-contain" loop muted={muted} playsInline poster={reel.thumbnailUrl || undefined} onClick={togglePlay} />
      )}
      {!isYouTube && !playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-5"><Play className="w-10 h-10 text-white fill-white" /></div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-20 left-4 right-16 text-white pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-8 h-8 border border-white/40">
            <AvatarImage src={reel.userAvatarUrl || ""} />
            <AvatarFallback className="text-xs bg-white/20 text-white">{(reel.userName || "?").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{reel.userName || "User"}</span>
        </div>
        <h3 className="font-bold text-base leading-tight mb-1">{reel.title}</h3>
        {reel.description && <p className="text-white/80 text-sm line-clamp-2">{reel.description}</p>}
      </div>
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 text-white">
          <div className={`p-2 rounded-full transition-colors ${liked ? "bg-red-500" : "bg-black/30"}`}><Heart className={`w-6 h-6 ${liked ? "fill-white" : ""}`} /></div>
          <span className="text-xs font-medium">{likeCount}</span>
        </button>
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 text-white">
          <div className="p-2 rounded-full bg-black/30"><MessageCircle className="w-6 h-6" /></div>
          <span className="text-xs font-medium">{reel.commentCount}</span>
        </button>
        <button onClick={() => navigator.share?.({ title: reel.title, url: window.location.href }).catch(() => {})} className="flex flex-col items-center gap-1 text-white">
          <div className="p-2 rounded-full bg-black/30"><Share2 className="w-6 h-6" /></div>
          <span className="text-xs font-medium">Share</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-white">
          <div className="p-2 rounded-full bg-black/30"><Eye className="w-6 h-6" /></div>
          <span className="text-xs font-medium">{reel.viewCount}</span>
        </div>
        {!isYouTube && (
          <button onClick={() => setMuted(!muted)} className="text-white">
            <div className="p-2 rounded-full bg-black/30">{muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</div>
          </button>
        )}
      </div>
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 bg-background rounded-t-2xl flex flex-col max-h-[70%] z-20">
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <h4 className="font-semibold">Comments</h4>
            <button onClick={() => setShowComments(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!comments?.length ? (
              <p className="text-center text-muted-foreground text-sm py-4">No comments yet. Be first!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarImage src={c.userAvatarUrl || ""} />
                    <AvatarFallback className="text-xs">{(c.userName || "?").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold text-xs">{c.userName || "User"} </span>
                    <span className="text-sm">{c.content}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleComment} className="p-3 border-t flex gap-2 shrink-0">
            <Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1" />
            <Button type="submit" size="icon" disabled={addComment.isPending}><Send className="w-4 h-4" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Reels() {
  const { user } = useAuth();
  const { data: reels, isLoading } = useListReels();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex(idx);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (!reels?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center"><Play className="w-10 h-10 text-muted-foreground" /></div>
        <h2 className="text-xl font-bold">No Reels Yet</h2>
        <p className="text-muted-foreground max-w-xs">Be the first to share a short video with the Bhaleri community!</p>
        {user && <Link href="/reels/new"><Button><Plus className="w-4 h-4 mr-2" /> Create Reel</Button></Link>}
      </div>
    );
  }

  return (
    <div className="relative -mx-4 -my-6 md:-my-8">
      {user && (
        <Link href="/reels/new">
          <button className="absolute top-4 right-4 z-30 bg-primary text-primary-foreground rounded-full p-3 shadow-lg"><Plus className="w-5 h-5" /></button>
        </Link>
      )}
      <div className="absolute top-4 left-4 z-30 text-white font-bold text-lg drop-shadow">🎬 Reels</div>
      <div ref={containerRef} onScroll={handleScroll} className="overflow-y-scroll" style={{ height: "calc(100vh - 56px - 64px)", scrollSnapType: "y mandatory", scrollbarWidth: "none" }}>
        {reels.map((reel, i) => (
          <div key={reel.id} style={{ scrollSnapAlign: "start", height: "calc(100vh - 56px - 64px)" }}>
            <ReelCard reel={reel} isActive={i === activeIndex} />
          </div>
        ))}
      </div>
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
        {reels.map((_, i) => (
          <div key={i} className={`rounded-full transition-all ${i === activeIndex ? "w-2 h-4 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
