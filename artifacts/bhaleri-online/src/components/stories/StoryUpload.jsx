import { useRef, useState } from "react";
import { X, ImagePlus, Loader2, Music, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpload } from "@/hooks/use-upload";
import { useCreateStory } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StoryUpload({ onClose, onSuccess }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
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

  async function handleSubmit() {
    if (!file) {
      toast({ title: "Pehle photo ya video select karein", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (!result) throw new Error("Upload fail hua. Internet check karein aur dobara try karein.");
      await createStory.mutateAsync({
        mediaUrl: result.objectUrl,
        mediaType: file.type.startsWith("video") ? "video" : "image",
        caption: caption.trim() || undefined,
        title: title.trim() || undefined,
        musicUrl: musicUrl.trim() || undefined,
      });
      toast({ title: "Story post ho gayi!" });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast({ title: err.message || "Story post karne mein masla aaya", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[95dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10">
          <span className="font-semibold text-base">Nayi Story</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Photo/Video picker */}
          {!preview ? (
            <button
              className="w-full h-44 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-10 h-10" />
              <span className="text-sm font-medium">Photo ya Video select karein</span>
              <span className="text-xs text-muted-foreground/60">Tap to open gallery</span>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden max-h-56 bg-black flex items-center justify-center">
              {preview.type === "video"
                ? <video src={preview.url} className="w-full max-h-56 object-contain" muted autoPlay loop playsInline />
                : <img src={preview.url} alt="preview" className="w-full max-h-56 object-contain" />}
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                onClick={() => { setPreview(null); setFile(null); }}
              >
                <X className="w-4 h-4" />
              </button>
              <button
                className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full px-3 py-1 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                Change
              </button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />

          {/* Title */}
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Story ka title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              className="text-sm"
            />
          </div>

          {/* Caption */}
          <textarea
            placeholder="Caption likhein… (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            rows={2}
            className="w-full resize-none rounded-xl border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          {/* Music */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Song URL (mp3 link) — optional"
                value={musicUrl}
                onChange={(e) => setMusicUrl(e.target.value)}
                className="text-sm"
              />
            </div>
            <p className="text-[11px] text-muted-foreground pl-6">Koi bhi .mp3 ya audio link paste karein — story ke saath bajega</p>
          </div>

          <Button className="w-full" disabled={!file || uploading} onClick={handleSubmit}>
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upload ho raha hai…</> : "Story Share Karein"}
          </Button>
        </div>
      </div>
    </div>
  );
}
