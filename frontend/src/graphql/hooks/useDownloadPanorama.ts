import { axiosClient } from "config/axios";
import { useState, useCallback } from "react";

export function useDownloadPanorama() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (previewUrl: string, fileName: string) => {
    try {
      setLoading(true);
      setError(null);

      const fileRes = await axiosClient.get(previewUrl, {
        responseType: "blob",
      });

      const blob = new Blob([fileRes.data]);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);
      setError(err?.message || "Download failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { download, loading, error };
}
