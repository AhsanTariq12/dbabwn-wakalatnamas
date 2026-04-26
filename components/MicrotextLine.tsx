"use client"
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  text?: string;
  className?: string;
}

export default function MicrotextLine({
  text = " ",
  className = ""
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [repeatCount, setRepeatCount] = useState(1);

  useEffect(() => {
    const calculate = () => {
      if (!containerRef.current || !measureRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = measureRef.current.offsetWidth;

      if (textWidth === 0) return;

      const count = Math.floor(containerWidth / textWidth);
      setRepeatCount(count);
    };

    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap flex items-center text-gray-400 font-bold z-10 select-none opacity-50 text-center leading-tight tracking-widest mt-2 ${className}`}
      style={{
        fontSize: '6pt',
        lineHeight: '1.2',
        height: '6pt',
        userSelect: 'none'
      }}
    >
      {/* Hidden measurement */}
      <span
        ref={measureRef}
        className="absolute opacity-0 whitespace-nowrap"
      >
        {text}
      </span>

      {/* Render only full repetitions */}
      {Array.from({ length: repeatCount }).map((_, i) => (
        <span key={i}>{text}</span>
      ))}
    </div>
  );
}