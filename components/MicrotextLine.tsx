import React from 'react';

interface Props {
  text?: string;
  className?: string;
}

export default function MicrotextLine({
  text = "District Bar Association Bahawalnagar",
  className = ""
}: Props) {
  // Repeat the text enough times to fill the container width
  const repeatedText = text.repeat(250);

  return (
    <div
      className={`overflow-hidden whitespace-nowrap flex items-center text-gray-400 opacity-80 ${className}`}
      style={{
        fontSize: '2.4pt',       // Extremely small
        letterSpacing: '-0.2pt', // Squished denser
        lineHeight: '1',
        height: '4pt',           // Tighter height for border framing
        userSelect: 'none',
        flexWrap: 'nowrap'
      }}
      aria-hidden="true"
    >
      {repeatedText}
    </div>
  );
}
