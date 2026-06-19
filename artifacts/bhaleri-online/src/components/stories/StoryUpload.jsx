import { useRef, useState } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/hooks/use-upload";
import { useCreateStory } from "@/lib/api";

export default function StoryUpload({ onClose, onSuccess }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const createStory = useCreateStory();
  const { uploadFile } = useUpload();

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview({ url, type: f.type.startsWith("video") ? "video" : "image" });
  }

  async function handleSubmit() {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (!result) throw new Error("Upload failed");
      await createStory.mutateAsync({
        mediaUrl: result.objectUrl,
        mediaType: file.type.startsWith("video") ? "video" : "image",
        caption: caption.trim() || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.message || "Failed to post story");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-base">New Story</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!preview ? (
            <button
              className="w-full aspect-[9/12] max-h-64 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-10 h-10" />
              <span className="text-sm font-medium">Tap to add photo or video</span>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden aspect-[9/12] max-h-64 bg-black">
              {preview.type === "video" ? (
                <video src={preview.url} className="w-full h-full object-contain" muted autoPlay loop playsInline />
              ) : (
                <img src={preview.url} alt="preview" className="w-full h-full object-contain" />
              )}
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                onClick={() => { setPreview(null); setFile(null); }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <textarea
            placeholder="Add a caption... (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            rows={2}
            className="w-full resize-none rounded-xl border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <Button
            className="w-full"
            disabled={!file || uploading}
            onClick={handleSubmit}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting…</>
            ) : (
              "Share Story"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
