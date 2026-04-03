import React, { useEffect, useRef } from "react";

export default function QualitySlider({ value, onChange }) {
  const trackRef = useRef(null);

  // Update CSS custom property so the filled-track gradient follows the thumb
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.setProperty("--progress", `${value}%`);
    }
  }, [value]);

  const label =
    value >= 85 ? "High quality" :
    value >= 60 ? "Balanced" :
    value >= 35 ? "Smaller file" : "Maximum compression";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">Compression Quality</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{label}</span>
          <span className="text-lg font-bold text-indigo-400 w-10 text-right">{value}</span>
        </div>
      </div>

      <input
        ref={trackRef}
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full outline-none"
      />

      <div className="flex justify-between text-xs text-slate-600">
        <span>Smallest</span>
        <span>Best quality</span>
      </div>
    </div>
  );
}
