import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useListReels, useToggleReelLike, useRecordReelView, useListReelComments, useAddReelComment } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Eye, Plus, Volume2, VolumeX, Send, X, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

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

  const ytId = getYouTubeId(reel.videoUrl);

  // Fix: handle play() Promise race condition properly
  useEffect(() => {
    const video = videoRef.current;
    if (!video || ytId) return;

    let cancelled = false;

    if (isActive) {
      const promise = video.play();
      if (promise !== undefined) {
        promise
          .then(() => { if (!cancelled) setPlaying(true); })
          .catch((err) => {
            // AbortError is expected when pause() fires before play() resolves
            if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
              console.warn("Video play error:", err.message);
            }
            if (!cancelled) setPlaying(false);
          });
      }
      if (!viewRecordedRef.current) {
        recordView.mutate({ id: reel.id });
        viewRecordedRef.current = true;
      }
    } else {
      video.pause();
      if (!cancelled) setPlaying(false);
    }

    return () => { cancelled = true; };
  }, [isActive, ytId, reel.id]); // removed recordView from deps to avoid re-runs

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      const promise = video.play();
      if (promise !== undefined) {
        promise
          .then(() => setPlaying(true))
          .catch((err) => {
            if (err.name !== "AbortError") console.warn(err);
            setPlaying(false);
          });
      }
    }
  };

  const handleLike = () => {
    if (!user) { toast({ title: "Like karne ke liye login karein", variant: "destructive" }); return; }
    const prev = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    toggleLike.mutate({ id: reel.id }, {
      onSuccess: (d) => { setLiked(d.liked); setLikeCount(d.likeCount); },
      onError: () => { setLiked(prev); setLikeCount(prevCount); },
    });
  };

  const handleShare = async () => {
    const shareData = { title: reel.title, text: reel.description || reel.title, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied!" });
      }
    } catch (e) {
      // User cancelled share — no error needed
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!user) { toast({ title: "Comment karne ke liye login karein", variant: "destructive" }); return; }
    if (!commentText.trim()) return;
    addComment.mutate({ id: reel.id, data: { content: commentText } }, {
      onSuccess: () => {
        setCommentText("");
        qc.invalidateQueries({ queryKey: ["listReelComments", reel.id] });
      },
    });
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center select-none">
      {ytId ? (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=${isActive ? 1 : 0}&mute=1&loop=1&playlist=${ytId}&controls=0&playsinline=1&rel=0&modestbranding=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={reel.title}
          style={{ border: "none" }}
        />
      ) : (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="w-full h-full object-contain"
          loop
          muted={muted}
          playsInline
          preload="metadata"
          poster={reel.thumbnailUrl || undefined}
          onClick={togglePlay}
          onError={() => setPlaying(false)}
        />
      )}

      {/* Play icon overlay for non-YouTube when paused */}
      {!ytId && !playing && (
        <button
          className="absolute inset-0 flex items-center justify-center"
          onClick={togglePlay}
          aria-label="Play"
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-5">
            <Play className="w-10 h-10 text-white fill-white" />
          </div>
        </button>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

      {/* Bottom info */}
      <div className="absolute bottom-20 left-4 right-16 text-white pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-8 h-8 border-2 border-white/60">
            <AvatarImage src={reel.userAvatarUrl || ""} />
            <AvatarFallback className="text-xs bg-white/20 text-white">{(reel.userName || "?").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm drop-shadow">{reel.userName || "User"}</span>
        </div>
        <h3 className="font-bold text-base leading-tight mb-1 drop-shadow">{reel.title}</h3>
        {reel.description && <p className="text-white/80 text-sm line-clamp-2">{reel.description}</p>}
      </div>

      {/* Right action buttons */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 text-white">
          <div className={`p-2.5 rounded-full transition-all active:scale-90 ${liked ? "bg-red-500 scale-110" : "bg-black/40 backdrop-blur-sm"}`}>
            <Heart className={`w-6 h-6 transition-all ${liked ? "fill-white text-white" : ""}`} />
          </div>
          <span className="text-xs font-bold drop-shadow">{likeCount}</span>
        </button>

        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 text-white">
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm active:scale-90">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold drop-shadow">{reel.commentCount}</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white">
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm active:scale-90">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold drop-shadow">Share</span>
        </button>

        <div className="flex flex-col items-center gap-1 text-white pointer-events-none">
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
            <Eye className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold drop-shadow">{reel.viewCount}</span>
        </div>

        {!ytId && (
          <button onClick={() => setMuted(!muted)} className="text-white">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm active:scale-90">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </div>
          </button>
        )}
      </div>

      {/* Comments drawer */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 bg-background rounded-t-2xl flex flex-col max-h-[70%] z-20 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <h4 className="font-semibold">Comments</h4>
            <button onClick={() => setShowComments(false)} className="p-1 rounded-full hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!comments?.length ? (
              <div className="text-center py-8">
                <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No comments yet. Pehla comment karein!</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={c.userAvatarUrl || ""} />
                    <AvatarFallback className="text-xs bg-primary/10">{(c.userName || "?").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="font-semibold text-xs text-primary">{c.userName || "User"} </span>
                    <span className="text-sm">{c.content}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleComment} className="p-3 border-t flex gap-2 shrink-0 bg-background">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={user ? "Comment likhein..." : "Comment ke liye login karein"}
              className="flex-1 bg-muted/40 border-0 focus-visible:ring-1"
              disabled={!user}
            />
            <Button type="submit" size="icon" disabled={addComment.isPending || !commentText.trim()}>
              <Send className="w-4 h-4" />
            </Button>
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
          <p className="text-muted-foreground text-sm">Reels load ho rahe hain...</p>
        </div>
      </div>
    );
  }

  if (!reels?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4 px-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Play className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Abhi Koi Reel Nahi</h2>
        <p className="text-muted-foreground max-w-xs text-sm">Bhaleri community ke saath pehla short video share karein!</p>
        {user && (
          <Link href="/reels/new">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Reel Banayein</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="relative -mx-4 -my-6 md:-my-8">
      {user && (
        <Link href="/reels/new">
          <button className="absolute top-4 right-4 z-30 bg-primary text-primary-foreground rounded-full p-3 shadow-xl active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
          </button>
        </Link>
      )}
      <div className="absolute top-4 left-4 z-30 text-white font-bold text-lg drop-shadow-lg">🎬 Reels</div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-scroll"
        style={{ height: "calc(100vh - 56px - 64px)", scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
      >
        {reels.map((reel, i) => (
          <div key={reel.id} style={{ scrollSnapAlign: "start", height: "calc(100vh - 56px - 64px)" }}>
            <ReelCard reel={reel} isActive={i === activeIndex} />
          </div>
        ))}
      </div>

      {/* Scroll progress dots */}
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 pointer-events-none">
        {reels.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-200 ${i === activeIndex ? "w-2 h-4 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
