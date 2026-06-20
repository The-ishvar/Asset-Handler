import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import {
  useListPosts, useCreatePost, useDeletePost, useLikePost,
  useGetPostComments, useAddPostComment
} from "@/lib/api";
import { useUpload } from "@/hooks/use-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Heart, MessageCircle, Share2, Trash2, Image as ImageIcon,
  Send, X, ChevronDown, ChevronUp, Upload, Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function PostCard({ post, currentUser }) {
  const { toast } = useToast();
  const likePost = useLikePost();
  const deletePost = useDeletePost();
  const addComment = useAddPostComment();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [optimisticLiked, setOptimisticLiked] = useState(post.likedByMe);
  const [optimisticCount, setOptimisticCount] = useState(post.likesCount);

  const { data: comments } = useGetPostComments(post.id, { enabled: showComments });

  const handleLike = () => {
    if (!currentUser) { toast({ title: "Like karne ke liye login karein", variant: "destructive" }); return; }
    setOptimisticLiked(!optimisticLiked);
    setOptimisticCount((c) => optimisticLiked ? c - 1 : c + 1);
    likePost.mutate(post.id);
  };

  const handleDelete = () => {
    if (!confirm("Post delete karna chahte hain?")) return;
    deletePost.mutate(post.id, {
      onSuccess: () => toast({ title: "Post deleted" }),
    });
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!currentUser) { toast({ title: "Comment karne ke liye login karein", variant: "destructive" }); return; }
    addComment.mutate({ id: post.id, content: commentText }, {
      onSuccess: () => setCommentText(""),
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Bhaleri Online Post", text: post.content });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied!" });
    }
  };

  let mediaUrls = [];
  try { mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : []; } catch {}

  const canDelete = currentUser?.id === post.userId || currentUser?.role === "admin" || currentUser?.role === "super_admin";

  return (
    <div className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link href={`/profile/${post.userId}`}>
          <div className="flex items-center gap-3 cursor-pointer group">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.userAvatar || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {(post.userName || "?").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm group-hover:text-primary transition-colors">{post.userName || "User"}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        </Link>
        {canDelete && (
          <button onClick={handleDelete} className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" disabled={deletePost.isPending}>
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
              <span key={tag} className="text-xs text-primary font-medium">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {mediaUrls.length > 0 && (
        <div className={`${mediaUrls.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}`}>
          {mediaUrls.slice(0, 4).map((url, i) => (
            <div key={i} className={`relative overflow-hidden ${mediaUrls.length === 1 ? "max-h-96" : "aspect-square"}`}>
              {url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                <video src={url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={url} alt={`Media ${i+1}`} className="w-full h-full object-cover" />
              )}
              {i === 3 && mediaUrls.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl">
                  +{mediaUrls.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-2 border-t">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${optimisticLiked ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-muted-foreground hover:bg-muted"}`}
        >
          <Heart className={`w-4 h-4 ${optimisticLiked ? "fill-red-500" : ""}`} />
          {optimisticCount > 0 && <span>{optimisticCount}</span>}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t px-4 py-3 space-y-3 bg-muted/20">
          {comments?.length === 0 && <p className="text-xs text-muted-foreground">No comments yet.</p>}
          {comments?.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarImage src={c.userAvatar || ""} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{(c.userName || "?")[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-card rounded-xl px-3 py-2">
                <div className="text-xs font-semibold">{c.userName}</div>
                <div className="text-sm mt-0.5">{c.content}</div>
              </div>
            </div>
          ))}
          {currentUser && (
            <form onSubmit={handleComment} className="flex gap-2">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarImage src={currentUser.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{(currentUser.name || "?")[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  className="h-8 text-sm"
                  placeholder="Comment likhein..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button type="submit" size="sm" className="h-8 px-3" disabled={addComment.isPending || !commentText.trim()}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function CreatePostBox({ user }) {
  const { toast } = useToast();
  const createPost = useCreatePost();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [mediaUrls, setMediaUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { uploadFile } = useUpload({
    onSuccess: (result) => {
      setMediaUrls((prev) => [...prev, result.objectUrl]);
      setUploading(false);
    },
    onError: () => { setUploading(false); toast({ title: "Upload fail ho gaya", variant: "destructive" }); },
  });

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (mediaUrls.length + files.length > 4) { toast({ title: "Maximum 4 media files allowed hain", variant: "destructive" }); return; }
    setUploading(true);
    for (const file of files) {
      await uploadFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) { toast({ title: "Post kuch likhein", variant: "destructive" }); return; }
    createPost.mutate({ content, tags: tags || null, mediaUrls: mediaUrls.length ? mediaUrls : null }, {
      onSuccess: () => {
        setContent(""); setTags(""); setMediaUrls([]); setExpanded(false);
        toast({ title: "Post share ho gaya!" });
      },
      onError: (err) => toast({ title: "Kuch gadbad ho gayi", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="bg-card border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={user.avatarUrl || ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <button
          className="flex-1 bg-muted/60 hover:bg-muted text-muted-foreground text-sm rounded-full px-4 py-2.5 text-left transition-colors"
          onClick={() => setExpanded(true)}
        >
          Kuch share karein Bhaleri community ke saath...
        </button>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Textarea
            placeholder="Kuch likhein..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            autoFocus
          />
          <Input
            placeholder="Tags (comma separated): #news, #event, #help"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {mediaUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  {url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                    <video src={url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={url} alt={`media ${i+1}`} className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => setMediaUrls((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted">
                <ImageIcon className="w-4 h-4" />
                <span>{uploading ? "Uploading..." : "Photo/Video"}</span>
                <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={createPost.isPending || uploading || !content.trim()}>
                {createPost.isPending ? "Sharing..." : "Share Karein"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function PostsPage() {
  const { user } = useAuth();
  const { data: posts, isLoading } = useListPosts();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Community Posts</h1>
          <p className="text-muted-foreground">Bhaleri ke logon ke saath updates share karein</p>
        </div>
      </div>

      {user && <CreatePostBox user={user} />}

      {!user && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
          <p className="text-muted-foreground mb-3">Posts dekhne aur share karne ke liye login karein</p>
          <Link href="/login"><Button>Login Karein</Button></Link>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-card border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : !posts?.length ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Abhi koi post nahi hai.</p>
          <p className="text-sm text-muted-foreground mt-1">Pehle post share karein!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} />
          ))}
        </div>
      )}
    </div>
  );
}
