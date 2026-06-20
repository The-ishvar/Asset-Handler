import { useState, useEffect, useRef } from "react";
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
import { ArrowLeft, Play, Upload, Video, CheckCircle2, X, Tag } from "lucide-react";

export default function NewReel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createReel = useCreateReel();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploadedPath, setUploadedPath] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (result) => {
      setUploadedPath(result.objectUrl);
      toast({ title: "Video upload ho gaya!" });
    },
    onError: (err) => {
      toast({ title: "Upload fail ho gaya", description: err.message, variant: "destructive" });
    },
  });

  useEffect(() => { if (!user) setLocation("/login"); }, [user]);
  if (!user) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "Kripya video file select karein", variant: "destructive" }); return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "Video 100MB se chhoti honi chahiye", variant: "destructive" }); return;
    }
    setSelectedFile(file);
    // Local preview before upload
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    await uploadFile(file);
  };

  const handleRemoveVideo = () => {
    setUploadedPath(null);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uploadedPath) {
      toast({ title: "Pehle video upload karein", variant: "destructive" }); return;
    }
    if (!title.trim()) {
      toast({ title: "Title zaroor likhein", variant: "destructive" }); return;
    }
    createReel.mutate(
      {
        title: title.trim(),
        description: description || undefined,
        videoUrl: uploadedPath,
        thumbnailUrl: undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "🎬 Reel post ho gaya!" });
          setLocation("/reels");
        },
        onError: (err) => toast({ title: "Reel post nahi hua", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/reels">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Reel Banayein</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Video Upload */}
            <div className="space-y-3">
              <Label>Video Upload *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {!selectedFile && !isUploading && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl p-10 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">Gallery se video choose karein</p>
                    <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI — max 100MB</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium mt-1">
                    <Upload className="w-4 h-4" />
                    Device se Upload
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
                      <span className="text-muted-foreground truncate max-w-[200px]">{selectedFile?.name}...</span>
                      <span className="font-medium text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {selectedFile && !isUploading && (
                <div className="space-y-3">
                  <div className={`border-2 rounded-xl p-4 flex items-center gap-3 ${uploadedPath ? "border-green-500/40 bg-green-50/50 dark:bg-green-900/10" : "border-yellow-500/40 bg-yellow-50/50"}`}>
                    {uploadedPath ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                    ) : (
                      <Upload className="w-6 h-6 text-yellow-600 shrink-0 animate-pulse" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${uploadedPath ? "text-green-700 dark:text-green-400" : "text-yellow-700"}`}>
                        {uploadedPath ? "Video upload ho gaya!" : "Uploading..."}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{selectedFile.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="text-muted-foreground hover:text-foreground p-1 rounded shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Video preview */}
                  {previewUrl && (
                    <div className="rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-80">
                      <video src={previewUrl} className="w-full h-full object-contain" controls />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Reel ka catchy title likhein"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="#funny, #dance, #village, #bhaleri"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                placeholder="Is reel ke baare mein kuch likhein..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setLocation("/reels")}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createReel.isPending || isUploading || !uploadedPath}
              >
                <Play className="w-4 h-4 mr-2" />
                {createReel.isPending ? "Post ho raha hai..." : isUploading ? "Upload ho raha hai..." : "Reel Post Karein"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
