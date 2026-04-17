'use client'

import { Monitor, Download, ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function DesktopRequiredPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        
        {/* Animated Icon Cluster */}
        <div className="relative flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 relative z-10">
            <Monitor size={48} />
          </div>
          <div className="absolute -top-4 -right-2 w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-bounce delay-700">
            <ShieldAlert size={24} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">Desktop App Required</h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            For security and <span className="text-blue-400 font-semibold underline decoration-blue-500/30 underline-offset-4">Anti-Fraud Silent Printing</span>, management features are restricted to the official desktop application.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-4">
          {/* Main Download Button */}
          <a
            href="#" // Replace with your actual GitHub Release URL later
            className="group relative flex items-center justify-center gap-3 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95"
          >
            <Download size={24} />
            <span>Download DBABWN WakalatNamas for Windows</span>
          </a>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 h-14 text-gray-500 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Viewer Dashboard
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Feature</p>
            <p className="text-sm text-gray-300">Silent Printing (No Dialogs)</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Security</p>
            <p className="text-sm text-gray-300">Local Identity Verification</p>
          </div>
        </div>

      </div>
    </div>
  )
}
