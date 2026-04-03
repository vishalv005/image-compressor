import React, { useRef, useState, useCallback } from "react";

export default function DropZone({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4
        h-56 rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-300 select-none
        ${dragging
          ? "drag-over bg-indigo-950/40 border-indigo-400"
          : "border-slate-600 bg-slate-800/50 hover:border-indigo-500 hover:bg-slate-800"}
      `}
    >
      {/* Upload icon */}
      <div className={`p-4 rounded-full transition-all duration-300 ${dragging ? "bg-indigo-500/30" : "bg-slate-700"}`}>
        <svg className={`w-8 h-8 transition-colors ${dragging ? "text-indigo-300" : "text-slate-400"}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-slate-300 font-medium">
          {dragging ? "Drop it!" : "Drag & drop an image"}
        </p>
        <p className="text-slate-500 text-sm mt-1">or click to browse · JPEG, PNG, WebP · max 5 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}
