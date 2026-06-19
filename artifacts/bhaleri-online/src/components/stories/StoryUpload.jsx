import { useRef, useState } from "react";
import { X, ImagePlus, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpload } from "@/hooks/use-upload";
import { useCreateStory } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StoryUpload({ onClose, onSuccess }) {
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState("url");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const createStory = useCreateStory();
  const { uploadFile } = useUpload();
  const { toast } = useToast();

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview({ url: URL.createObjectURL(f), type: f.type.startsWith("video") ? "video" : "image" });
  }

  function handleUrlPreview() {
    const url = urlInput.trim();
    if (!url) return;
    const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
    setPreview({ url, type: isVideo ? "video" : "image" });
  }

  async function handleSubmit() {
    setUploading(true);
    try {
      let mediaUrl = "";
      let mediaType = "image";

      if (mode === "file") {
        if (!file) { toast({ title: "Please select a file", variant: "destructive" }); setUploading(false); return; }
        const result = await uploadFile(file);
        if (!result) throw new Error("Upload failed. Please use URL option instead.");
        mediaUrl = result.objectUrl;
        mediaType = file.type.startsWith("video") ? "video" : "image";
      } else {
        const url = urlInput.trim();
        if (!url) { toast({ title: "Please enter an image or video URL", variant: "destructive" }); setUploading(false); return; }
        mediaUrl = url;
        mediaType = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) ? "video" : "image";
      }

      await createStory.mutateAsync({
        mediaUrl,
        mediaType,
        caption: caption.trim() || undefined,
      });
      toast({ title: "Story posted!" });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast({ title: err.message || "Story post karne mein problem aayi", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  const canSubmit = mode === "file" ? !!file : !!urlInput.trim();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-base">New Story</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Mode toggle */}
          <div className="flex rounded-xl border overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => { setMode("url"); setPreview(null); setFile(null); }}
              className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === "url" ? "bg-primary text-white" : "hover:bg-muted/50 text-muted-foreground"}`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Image URL
            </button>
            <button
              type="button"
              onClick={() => { setMode("file"); setPreview(null); setUrlInput(""); }}
              className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors ${mode === "file" ? "bg-primary text-white" : "hover:bg-muted/50 text-muted-foreground"}`}
            >
              <ImagePlus className="w-3.5 h-3.5" /> Upload File
            </button>
          </div>

          {/* URL mode */}
          {mode === "url" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/photo.jpg"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setPreview(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlPreview()}
                  className="flex-1 text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleUrlPreview} disabled={!urlInput.trim()}>
                  Preview
                </Button>
              </div>
              {preview ? (
                <div className="relative rounded-xl overflow-hidden max-h-52 bg-black flex items-center justify-center">
                  {preview.type === "video" ? (
                    <video src={preview.url} className="w-full max-h-52 object-contain" muted autoPlay loop playsInline />
                  ) : (
                    <img src={preview.url} alt="preview" className="w-full max-h-52 object-contain"
                      onError={() => { setPreview(null); toast({ title: "Image load nahi hua. URL check karein.", variant: "destructive" }); }} />
                  )}
                  <button className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1" onClick={() => { setPreview(null); setUrlInput(""); }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-28 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                  URL daalo aur Preview dabao
                </div>
              )}
            </div>
          )}

          {/* File mode */}
          {mode === "file" && (
            <>
              {!preview ? (
                <button
                  className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-10 h-10" />
                  <span className="text-sm font-medium">Photo ya video add karein</span>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden max-h-52 bg-black flex items-center justify-center">
                  {preview.type === "video"
                    ? <video src={preview.url} className="w-full max-h-52 object-contain" muted autoPlay loop playsInline />
                    : <img src={preview.url} alt="preview" className="w-full max-h-52 object-contain" />}
                  <button className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1" onClick={() => { setPreview(null); setFile(null); }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
            </>
          )}

          <textarea
            placeholder="Caption add karein… (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            rows={2}
            className="w-full resize-none rounded-xl border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <Button className="w-full" disabled={!canSubmit || uploading} onClick={handleSubmit}>
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting…</> : "Story Share Karein"}
          </Button>
        </div>
      </div>
    </div>
  );
}
