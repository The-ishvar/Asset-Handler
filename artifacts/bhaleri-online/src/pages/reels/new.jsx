import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useCreateReel } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play } from "lucide-react";

export default function NewReel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createReel = useCreateReel();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  if (!user) { setLocation("/login"); return null; }

  const handleSubmit = (e) => {
    e.preventDefault();
    createReel.mutate(
      { title, description, videoUrl, thumbnailUrl },
      {
        onSuccess: () => {
          toast({ title: "Reel posted successfully!" });
          setLocation("/reels");
        },
        onError: (err) => toast({ title: "Failed to post reel", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/reels"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-2xl font-bold">Create Reel</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Give your reel a catchy title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Video URL *</Label>
              <Input type="url" placeholder="YouTube link or direct video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
              <p className="text-xs text-muted-foreground">Paste a YouTube link or a direct video file URL (.mp4)</p>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL (Optional)</Label>
              <Input type="url" placeholder="Cover image URL" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea placeholder="What's this reel about?" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            {videoUrl && (
              <div className="rounded-lg overflow-hidden bg-black aspect-video">
                {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                  <iframe src={videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} className="w-full h-full" allow="autoplay" title="Preview" />
                ) : (
                  <video src={videoUrl} className="w-full h-full" controls />
                )}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/reels")}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={createReel.isPending}>
                <Play className="w-4 h-4 mr-2" />
                {createReel.isPending ? "Posting..." : "Post Reel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
