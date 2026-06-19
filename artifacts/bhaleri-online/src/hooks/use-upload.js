import { useState, useCallback, useRef } from "react";
import { getAuthToken } from "@/lib/api";

export function useUpload({ onSuccess, onError } = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const uploadFile = useCallback(async (file) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      setProgress(10);
      const token = getAuthToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "video/mp4",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get upload URL");
      }

      const { uploadURL, objectPath } = await res.json();

      setProgress(30);

      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "video/mp4" },
      });

      setProgress(100);
      const result = { objectPath, objectUrl: `/api/storage${objectPath}` };
      onSuccessRef.current?.(result);
      return result;
    } catch (err) {
      setError(err);
      onErrorRef.current?.(err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadFile, isUploading, progress, error };
}
