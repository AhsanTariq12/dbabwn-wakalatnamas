import React from 'react';

// This is a Server Component. It will execute on the server dynamically if we force dynamic rendering.
export default function DotNoise() {
  // Generate 2500 faint random dots.
  // Because Math.random() is used here in a Server Component,
  // each server render gives a completely unique pattern.
  const numDots = 2500;
  const dots = [];

  for (let i = 0; i < numDots; i++) {
    const cx = Math.random() * 100; // 0 to 100% width
    const cy = Math.random() * 100; // 0 to 100% height
    const r = Math.random() * 0.4 + 0.15; // 0.15px to 0.55px radius
    
    // Very faint opacity: 5% to 15%
    const opacity = Math.random() * 0.1 + 0.05; 

    dots.push(
      <circle 
        key={i} 
        cx={`${cx}%`} 
        cy={`${cy}%`} 
        r={r} 
        fill="#000" 
        fillOpacity={opacity} 
      />
    );
  }

  return (
    <svg 
      className="absolute inset-0 w-full h-full z-10 pointer-events-none mix-blend-multiply opacity-50" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {dots}
    </svg>
  );
}
