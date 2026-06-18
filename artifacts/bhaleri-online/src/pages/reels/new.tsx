import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateReel } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, Info } from "lucide-react";

export default function NewReel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createReel = useCreateReel();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      toast({ title: "Title and video URL are required", variant: "destructive" });
      return;
    }
    createReel.mutate(
      { data: { title, description: description || null, videoUrl, thumbnailUrl: thumbnailUrl || null } },
      {
        onSuccess: () => {
          toast({ title: "Reel posted!", description: "Your reel is now live." });
          setLocation("/reels");
        },
        onError: (err) => {
          toast({ title: "Failed to post reel", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Video className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Create a Reel</h1>
          <p className="text-muted-foreground">Share a short video with Bhaleri community</p>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>How to add a video:</strong> Upload your video to YouTube (unlisted is fine), Google Drive, or any video hosting service, then paste the public URL here. YouTube links like <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">youtube.com/watch?v=...</code> are supported.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reel Details</CardTitle>
          <CardDescription>Fill in the details for your video reel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="What's this video about?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL <span className="text-red-500">*</span></Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://..."
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                placeholder="https://example.com/thumbnail.jpg"
                value={thumbnailUrl}
                onChange={e => setThumbnailUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell people about this video..."
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setLocation("/reels")}>
                Cancel
              </Button>
              <Button type="submit" disabled={createReel.isPending}>
                {createReel.isPending ? "Posting..." : "Post Reel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
