import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import api from "@/lib/api";

export default function ImageUpload({ value = [], onChange, max = 4 }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setUploading(true);
    const uploaded = [];

    for (const file of Array.from(files).slice(0, max - value.length)) {
      try {
        const { data } = await api.post("/storage/uploads/request-url", {
          name: file.name,
          size: file.size,
          contentType: file.type,
        });
        await fetch(data.uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        const path = data.objectPath.replace(/^\/objects\//, "");
        uploaded.push(`/api/storage/objects/${path}`);
      } catch (e) {
        console.error("Upload failed:", e);
      }
    }

    onChange([...value, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {value.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border bg-muted">
            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
            <button type="button" onClick={() => remove(i)}
              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? (
              <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px]">Uploading…</span>
              </div>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span className="text-[10px] text-center leading-tight px-1">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => handleFiles(e.target.files)} />
      <p className="text-xs text-muted-foreground">
        Tap to upload from gallery · Max {max} photos · JPG, PNG, WebP
      </p>
    </div>
  );
}
