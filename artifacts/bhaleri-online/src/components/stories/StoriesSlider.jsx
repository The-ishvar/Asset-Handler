import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useListStories } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StoryViewer from "./StoryViewer";
import StoryUpload from "./StoryUpload";

function groupStoriesByUser(stories) {
  const map = new Map();
  for (const story of stories) {
    if (!map.has(story.userId)) {
      map.set(story.userId, {
        userId: story.userId,
        userName: story.userName,
        userAvatarUrl: story.userAvatarUrl,
        stories: [],
      });
    }
    map.get(story.userId).stories.push(story);
  }
  return Array.from(map.values());
}

export default function StoriesSlider() {
  const { user } = useAuth();
  const { data: stories = [], isLoading } = useListStories();
  const [viewerData, setViewerData] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const scrollRef = useRef(null);

  const grouped = groupStoriesByUser(stories);

  const myGroup = user ? grouped.find((g) => g.userId === user.id) : null;
  const otherGroups = user ? grouped.filter((g) => g.userId !== user.id) : grouped;

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-0.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-14 h-14 rounded-full bg-muted animate-pulse" />
            <div className="w-10 h-2 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-0.5">
        {/* My story slot */}
        {user && (
          <button
            className="flex flex-col items-center gap-1 shrink-0 group"
            onClick={() => {
              if (myGroup) setViewerData({ stories: myGroup.stories, startIndex: 0 });
              else setShowUpload(true);
            }}
          >
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-full p-0.5 ${
                  myGroup
                    ? "bg-gradient-to-tr from-primary to-emerald-400"
                    : "bg-muted border-2 border-dashed border-muted-foreground/40"
                }`}
              >
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {(user.name || "?")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              {!myGroup && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium max-w-[56px] truncate">
              {myGroup ? "My Story" : "Add Story"}
            </span>
          </button>
        )}

        {/* Other users' stories */}
        {otherGroups.map((group) => (
          <button
            key={group.userId}
            className="flex flex-col items-center gap-1 shrink-0 group"
            onClick={() => setViewerData({ stories: group.stories, startIndex: 0 })}
          >
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-primary to-emerald-400">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={group.userAvatarUrl || ""} />
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">
                    {(group.userName || "?")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium max-w-[56px] truncate">
              {group.userName || "User"}
            </span>
          </button>
        ))}

        {/* Guest add button */}
        {!user && (
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-14 h-14 rounded-full bg-muted/60 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <Plus className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <span className="text-[10px] text-muted-foreground">Login karein</span>
          </div>
        )}

        {stories.length === 0 && !user && (
          <span className="text-xs text-muted-foreground self-center pl-2">No stories yet.</span>
        )}
      </div>

      {viewerData && (
        <StoryViewer
          stories={viewerData.stories}
          startIndex={viewerData.startIndex}
          onClose={() => setViewerData(null)}
        />
      )}

      {showUpload && (
        <StoryUpload
          onClose={() => setShowUpload(false)}
          onSuccess={() => setShowUpload(false)}
        />
      )}
    </>
  );
}
