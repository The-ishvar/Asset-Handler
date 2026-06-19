import { useEffect, useRef, useState } from "react";
import { X, Trash2, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useDeleteStory, useRecordStoryView } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StoryViewer({ stories, startIndex = 0, onClose }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const deleteStory = useDeleteStory();
  const recordView = useRecordStoryView();
  const DURATION = 5000;

  const story = stories[current];

  useEffect(() => {
    if (!story) return;
    recordView.mutate(story.id);
  }, [story?.id]);

  useEffect(() => {
    setProgress(0);
    clearInterval(progressRef.current);
    clearTimeout(timerRef.current);

    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
    }, 50);

    timerRef.current = setTimeout(() => {
      if (current < stories.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        onClose();
      }
    }, DURATION);

    return () => {
      clearInterval(progressRef.current);
      clearTimeout(timerRef.current);
    };
  }, [current, stories.length]);

  function goNext() {
    if (current < stories.length - 1) setCurrent((c) => c + 1);
    else onClose();
  }

  function goPrev() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  function handleDelete() {
    deleteStory.mutate(story.id, {
      onSuccess: () => {
        if (stories.length <= 1) onClose();
        else if (current >= stories.length - 1) setCurrent((c) => c - 1);
      },
    });
  }

  if (!story) return null;

  const isOwner = user && user.id === story.userId;
  const timeAgo = formatDistanceToNow(new Date(story.createdAt), { addSuffix: true });

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm h-full max-h-[100dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width:
                    i < current ? "100%" : i === current ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-20 px-3 pt-4 flex items-center gap-2">
          <Avatar className="w-9 h-9 border-2 border-white">
            <AvatarImage src={story.userAvatarUrl || ""} />
            <AvatarFallback className="text-xs bg-primary text-white">
              {(story.userName || "?")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">{story.userName || "User"}</div>
            <div className="text-white/70 text-xs">{timeAgo}</div>
          </div>
          <div className="flex items-center gap-1 text-white/80 text-xs mr-2">
            <Eye className="w-3.5 h-3.5" />
            <span>{story.viewCount}</span>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleteStory.isPending}
              className="text-white/80 hover:text-red-400 transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media */}
        <div className="flex-1 relative bg-black">
          {story.mediaType === "video" ? (
            <video
              key={story.id}
              src={story.mediaUrl}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              key={story.id}
              src={story.mediaUrl}
              alt={story.caption || "Story"}
              className="w-full h-full object-contain"
            />
          )}

          {/* Caption */}
          {story.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-sm text-center">{story.caption}</p>
            </div>
          )}
        </div>

        {/* Tap zones */}
        <div className="absolute inset-0 z-10 flex">
          <div className="flex-1 h-full cursor-pointer" onClick={goPrev} />
          <div className="flex-1 h-full cursor-pointer" onClick={goNext} />
        </div>
      </div>
    </div>
  );
}
