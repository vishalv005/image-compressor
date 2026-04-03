import { useState, useCallback } from "react";

// Point this at your Render backend URL in production via env var
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function useCompressor() {
  const [state, setState] = useState({
    file: null,
    originalPreview: null,
    originalSize: 0,
    compressedPreview: null,
    compressedSize: 0,
    reduction: null,
    mimeType: null,
    loading: false,
    error: null,
  });

  // ── Select / drop a file ───────────────────────────────────────────────────
  const selectFile = useCallback((file) => {
    if (!file) return;

    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setState((s) => ({ ...s, error: "Only JPEG, PNG, and WebP files are supported." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setState((s) => ({ ...s, error: "File must be under 5 MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) =>
      setState({
        file,
        originalPreview: e.target.result,
        originalSize: file.size,
        compressedPreview: null,
        compressedSize: 0,
        reduction: null,
        mimeType: file.type,
        loading: false,
        error: null,
      });
    reader.readAsDataURL(file);
  }, []);

  // ── Call /compress endpoint ────────────────────────────────────────────────
  const compress = useCallback(async (quality) => {
    setState((s) => {
      if (!s.file) return s;
      return { ...s, loading: true, error: null };
    });

    setState((prev) => {
      if (!prev.file) return prev;

      const formData = new FormData();
      formData.append("file", prev.file);
      formData.append("quality", quality);

      fetch(`${API_BASE}/compress`, { method: "POST", body: formData })
        .then((res) => {
          if (!res.ok) return res.json().then((d) => Promise.reject(d.error || "Server error"));
          return res.json();
        })
        .then((data) => {
          const dataUrl = `data:${data.mimeType};base64,${data.image}`;
          setState((s) => ({
            ...s,
            compressedPreview: dataUrl,
            compressedSize: data.compressedSize,
            reduction: data.reduction,
            loading: false,
            error: null,
          }));
        })
        .catch((err) => {
          setState((s) => ({
            ...s,
            loading: false,
            error: typeof err === "string" ? err : "Compression failed. Is the API running?",
          }));
        });

      return prev; // optimistic — actual update comes from .then()
    });
  }, []);

  // ── Download compressed image ──────────────────────────────────────────────
  const download = useCallback(() => {
    if (!state.compressedPreview || !state.file) return;

    const ext = state.mimeType.split("/")[1];
    const name = state.file.name.replace(/\.[^.]+$/, `_compressed.${ext}`);

    const a = document.createElement("a");
    a.href = state.compressedPreview;
    a.download = name;
    a.click();
  }, [state.compressedPreview, state.file, state.mimeType]);

  const reset = useCallback(() =>
    setState({
      file: null, originalPreview: null, originalSize: 0,
      compressedPreview: null, compressedSize: 0, reduction: null,
      mimeType: null, loading: false, error: null,
    }), []);

  return { ...state, selectFile, compress, download, reset };
}
