import React from 'react';

interface Props {
  width?: string | number;
  height?: number;
  className?: string;
}

export default function Guilloche({ 
  width = "100%", 
  height = 100,
  className = "" 
}: Props) {
  // Generate a wavy overlapping path
  const generatePath = (offset: number, amplitude: number, frequency: number, phase: number) => {
    let path = `M 0,${height / 2 + offset}`;
    // Generate a lot of points to make the curve smooth
    for (let x = 0; x <= 800; x += 2) { 
      // Combines two sine waves for a more complex interference pattern
      const y = (height / 2) + Math.sin(x * frequency + phase) * amplitude + Math.cos(x * (frequency * 1.5)) * (amplitude * 0.3) + offset;
      path += ` L ${x},${y}`;
    }
    return path;
  };

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 800 ${height}`} 
      preserveAspectRatio="none"
      className={`opacity-60 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Multiple overlapping fine lines. Photocopiers will struggle to reproduce these cleanly without aliasing into moiré patterns. */}
      <path d={generatePath(0, 30, 0.05, 0)} fill="none" stroke="#bcbcbc" strokeWidth="0.4" />
      <path d={generatePath(5, 25, 0.06, 2)} fill="none" stroke="#b0b0b0" strokeWidth="0.3" />
      <path d={generatePath(-5, 25, 0.055, 4)} fill="none" stroke="#c0c0c0" strokeWidth="0.35" />
      <path d={generatePath(0, 15, 0.08, 1)} fill="none" stroke="#adadad" strokeWidth="0.25" />
      <path d={generatePath(10, 35, 0.04, 3)} fill="none" stroke="#dcdcdc" strokeWidth="0.5" />
      <path d={generatePath(-10, 35, 0.045, 5)} fill="none" stroke="#cfcfcf" strokeWidth="0.4" />
      <path d={generatePath(2, 45, 0.03, 0.5)} fill="none" stroke="#e0e0e0" strokeWidth="0.6" />
      <path d={generatePath(-2, 45, 0.035, 1.5)} fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
    </svg>
  );
}
