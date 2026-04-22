import React from 'react';

export default function Watermark({
  text = "DBA BWN"
}: { text?: string }) {
  const items = Array.from({ length: 48 }); // Grid of repeating text

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center" aria-hidden="true">
      {/* 
        This container is rotated. We make it larger than the page so it covers the corners.
        The text is #000 with very low opacity, so a photocopier will either blow it out to full black
        or completely drop it depending on the contrast setting.
      */}
      <div
        className="w-[200%] h-[200%] absolute flex flex-wrap justify-center content-center rotate-[-35deg]"
      >
        {items.map((_, i) => (
          <span
            key={i}
            className="text-4xl sm:text-5xl font-black text-black opacity-[0.075] w-1/4 p-12 text-center select-none uppercase tracking-widest whitespace-nowrap"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
