import React, { useState } from "react";
import { useCompressor } from "./hooks/useCompressor";
import DropZone from "./components/DropZone";
import QualitySlider from "./components/QualitySlider";
import ImagePreview from "./components/ImagePreview";

export default function App() {
  const [quality, setQuality] = useState(75);
  const [cloudUrl, setCloudUrl] = useState("");
  const {
    file, originalPreview, originalSize,
    compressedPreview, compressedSize, reduction,
    loading, error,
    selectFile, compress, download, reset,
  } = useCompressor();
  const handleUpload = async () => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("https://image-compressor-gbhb.onrender.com/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setCloudUrl(data.url);

  } catch (err) {
    console.error("Upload error:", err);
  }
};
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="m9 9 6-6m0 0H9m6 0v6M9 15l-6 6m0 0h6m-6 0v-6" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">SquishIt</span>
          </div>

          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
            JPEG · PNG · WebP
          </span>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 bg-red-950/60 border border-red-800 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Drop zone — only when no file loaded */}
        {!file && <DropZone onFile={selectFile} />}

        {/* Controls + preview */}
        {file && (
          <div className="space-y-5">
            {/* File name + reset */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span className="text-sm text-slate-300 truncate">{file.name}</span>
              </div>
              <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 transition ml-3 shrink-0">
                ✕ Remove
              </button>
            </div>

            {/* Quality slider */}
            <div className="bg-slate-800/70 rounded-2xl p-5 border border-slate-700">
              <QualitySlider value={quality} onChange={setQuality} />
            </div>

            {/* Preview */}
            <ImagePreview
              originalSrc={originalPreview}
              originalSize={originalSize}
              compressedSrc={compressedPreview}
              compressedSize={compressedSize}
              reduction={reduction}
            />

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => compress(quality)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500
                  disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold
                  py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Compressing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="m9 9 6-6m0 0H9m6 0v6M9 15l-6 6m0 0h6m-6 0v-6" />
                    </svg>
                    Compress
                  </>
                )}
              </button>

              {compressedPreview && (
  <>
    <button
      onClick={download}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500
        text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.98]"
    >
      Download
    </button>

    <button
      onClick={handleUpload}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500
        text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.98]"
    >
      ☁️ Upload
    </button>
    {cloudUrl && (
  <div className="mt-4">
    <p className="text-sm text-slate-400">Stored in Cloud:</p>
    <img src={cloudUrl} className="w-40 rounded-lg mt-2" />
    <a href={cloudUrl} target="_blank" className="text-blue-400 underline">
      Open Image
    </a>
  </div>
)}
  </>
)}
            </div>
          </div>
        )}

        {/* Empty-state tip */}
        {!file && (
          <p className="text-center text-slate-600 text-sm">
            No account needed · processed in-memory · files never stored
          </p>
        )}
      </main>
    </div>
  );
}
