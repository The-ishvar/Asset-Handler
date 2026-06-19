import { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useCreateReel } from "@/lib/api";
import { useUpload } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, Upload, Link2, Video, CheckCircle2, X } from "lucide-react";

export default function NewReel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createReel = useCreateReel();
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState("upload"); // "upload" | "url"
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadedPath, setUploadedPath] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (result) => {
      setUploadedPath(result.objectUrl);
      toast({ title: "Video uploaded successfully!" });
    },
    onError: (err) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  if (!user) { setLocation("/login"); return null; }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "Please select a video file", variant: "destructive" }); return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "Video must be under 100MB", variant: "destructive" }); return;
    }
    setSelectedFile(file);
    await uploadFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalVideoUrl = mode === "upload" ? uploadedPath : videoUrl;
    if (!finalVideoUrl) {
      toast({ title: mode === "upload" ? "Please upload a video first" : "Please enter a video URL", variant: "destructive" }); return;
    }
    createReel.mutate(
      { title, description, videoUrl: finalVideoUrl, thumbnailUrl: thumbnailUrl || undefined },
      {
        onSuccess: () => {
          toast({ title: "🎬 Reel posted!" });
          setLocation("/reels");
        },
        onError: (err) => toast({ title: "Failed to post reel", description: err.message, variant: "destructive" }),
      }
    );
  };

  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/reels"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-2xl font-bold">Create Reel</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Give your reel a catchy title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            {/* Mode toggle */}
            <div className="space-y-3">
              <Label>Video Source</Label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setMode("upload")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${mode === "upload" ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground hover:border-muted-foreground/50"}`}>
                  <Upload className="w-4 h-4" /> Upload Video
                </button>
                <button type="button" onClick={() => setMode("url")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${mode === "url" ? "border-primary bg-primary/5 text-primary" : "border-muted text-muted-foreground hover:border-muted-foreground/50"}`}>
                  <Link2 className="w-4 h-4" /> Video URL
                </button>
              </div>
            </div>

            {mode === "upload" && (
              <div className="space-y-3">
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />

                {!uploadedPath && !isUploading && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <Video className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">Click to upload video</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI up to 100MB</p>
                    </div>
                  </button>
                )}

                {isUploading && (
                  <div className="w-full border-2 border-dashed border-primary/40 rounded-xl p-8 flex flex-col items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary animate-pulse" />
                    </div>
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uploading {selectedFile?.name}...</span>
                        <span className="font-medium text-primary">{progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                {uploadedPath && !isUploading && (
                  <div className="border-2 border-green-500/40 bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-green-700 dark:text-green-400">Video uploaded!</p>
                      <p className="text-xs text-muted-foreground truncate">{selectedFile?.name}</p>
                    </div>
                    <button type="button" onClick={() => { setUploadedPath(null); setSelectedFile(null); }} className="text-muted-foreground hover:text-foreground p-1 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {uploadedPath && (
                  <div className="rounded-lg overflow-hidden bg-black aspect-video">
                    <video src={uploadedPath} className="w-full h-full" controls />
                  </div>
                )}
              </div>
            )}

            {mode === "url" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Input type="url" placeholder="YouTube link or direct video URL (.mp4)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Paste a YouTube link or a direct MP4 video URL</p>
                </div>
                {videoUrl && (
                  <div className="rounded-lg overflow-hidden bg-black aspect-video">
                    {isYouTube ? (
                      <iframe src={videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} className="w-full h-full" allow="autoplay" title="Preview" />
                    ) : (
                      <video src={videoUrl} className="w-full h-full" controls />
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Thumbnail URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input type="url" placeholder="Cover image URL" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea placeholder="What's this reel about?" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/reels")}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={createReel.isPending || isUploading}>
                <Play className="w-4 h-4 mr-2" />
                {createReel.isPending ? "Posting..." : isUploading ? "Uploading..." : "Post Reel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
