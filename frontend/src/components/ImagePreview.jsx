import React from "react";

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function Card({ label, src, size, badge, badgeColor }) {
  return (
    <div className="flex-1 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
      <div className="relative">
        <img src={src} alt={label} className="w-full h-48 object-cover" />
        {badge && (
          <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-semibold text-slate-200">{fmt(size)}</span>
      </div>
    </div>
  );
}

export default function ImagePreview({ originalSrc, originalSize, compressedSrc, compressedSize, reduction }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Card label="Original" src={originalSrc} size={originalSize} />
        {compressedSrc && (
          <Card
            label="Compressed"
            src={compressedSrc}
            size={compressedSize}
            badge={`−${reduction}%`}
            badgeColor={
              Number(reduction) > 50
                ? "bg-emerald-500/90 text-white"
                : Number(reduction) > 20
                ? "bg-amber-500/90 text-white"
                : "bg-slate-600 text-slate-200"
            }
          />
        )}
      </div>

      {/* Stats bar */}
      {compressedSrc && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Original", value: fmt(originalSize), color: "text-slate-300" },
            { label: "Compressed", value: fmt(compressedSize), color: "text-indigo-400" },
            { label: "Saved", value: `${reduction}%`, color: Number(reduction) > 0 ? "text-emerald-400" : "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-800 rounded-lg py-2 px-1 border border-slate-700">
              <p className={`text-base font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
