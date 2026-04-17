"use client";

import React from 'react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="fixed top-8 right-8 print:hidden bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-xl hover:bg-blue-700 transition-colors z-50 flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      Print Wakalatnama
    </button>
  );
}
