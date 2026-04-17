'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, ShieldCheck, FileCheck2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [serial, setSerial] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const supabase = createClient()

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!serial) return
    
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const { data, error } = await supabase
        .from('wakalat_namas')
        .select(`
          serial_number,
          created_at,
          batches (
            batch_code
          )
        `)
        .eq('serial_number', serial.trim().toUpperCase())
        .single()

      if (error) {
        setError('This serial number could not be verified. Please double-check it.')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600">
              <ShieldCheck size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">DBA BWN</span>
          </div>
          <Link 
            href="/login" 
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Admin Access
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <span>Official Verification Portal</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Verify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Wakalat Nama</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Protect yourself from document fraud. Instantly check the authenticity of a document using its unique serial number.
          </p>
        </div>

        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <form 
            onSubmit={handleVerify}
            className="relative flex items-center bg-[#0a0a0a] rounded-2xl border border-white/10 p-2 shadow-2xl"
          >
            <div className="pl-4 text-gray-500"><Search size={24} /></div>
            <input 
              type="text"
              placeholder="Enter Serial Number (e.g. DBA-BWN-2026-...)"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="flex-1 h-14 bg-transparent px-4 focus:outline-none font-mono text-lg text-white placeholder:text-gray-600"
            />
            <button 
              type="submit"
              disabled={loading}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Now'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="mt-12 max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-red-400 text-lg">Verification Failed</h3>
                <p className="text-red-400/70 mt-1">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <FileCheck2 size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-400 text-2xl uppercase tracking-tight">Verified Authentic</h3>
                  <p className="text-emerald-400/70">This document was officially issued by DBA Bahawalnagar.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Serial Number</p>
                  <p className="text-xl font-mono text-white font-bold">{result.serial_number}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Issue Date</p>
                  <p className="text-xl text-white font-bold">{new Date(result.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Batch Reference</p>
                  <p className="text-xl font-mono text-white font-bold">{result.batches.batch_code}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-20 border-t border-white/5 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-600 text-sm">
          <p>© 2026 District Bar Association Bahawalnagar. Secure Document Management System.</p>
        </div>
      </footer>
    </div>
  )
}
