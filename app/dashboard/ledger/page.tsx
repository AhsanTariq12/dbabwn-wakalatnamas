'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, Loader2, Calendar, User, FileDigit } from 'lucide-react'
import Link from 'next/link'

export default function LedgerPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchBatches()
  }, [])

  async function fetchBatches() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('batches')
        .select('*, wakalat_namas(serial_number)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBatches = batches.filter(batch => 
    batch.batch_code.toLowerCase().includes(search.toLowerCase()) ||
    batch.wakalat_namas.some((w: any) => w.serial_number.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Print Ledger</h1>
        <p className="text-gray-400">Track and verify all issued Wakalat Nama batches.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
        <input 
          type="text"
          placeholder="Search serial or batch code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading history...</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border border-white/5 rounded-3xl">
            <p>No records found matching your search.</p>
          </div>
        ) : (
          filteredBatches.map((batch) => (
            <div 
              key={batch.id}
              className="group p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                    <FileDigit size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                       Batch: <span className="font-mono bg-white/5 text-blue-400 px-2 py-0.5 rounded uppercase">{batch.batch_code}</span>
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5 border border-white/10 px-2 py-0.5 rounded-md bg-white/5 font-mono text-gray-300">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(batch.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="mx-0.5 text-gray-600">|</span> 
                        {new Date(batch.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                      <span className="flex items-center gap-1.5"><User size={14} /> {batch.quantity} Forms</span>
                      <span className="text-emerald-400 font-medium">Rs {batch.amount_paid?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>


              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 ml-1">Serial Numbers Tracking</p>
                <div className="flex flex-wrap gap-2">
                  {batch.wakalat_namas.slice(0, 5).map((w: any) => (
                    <span key={w.serial_number} className="text-xs font-mono bg-black/40 border border-white/5 text-gray-400 px-3 py-1.5 rounded-lg group-hover:border-blue-500/30 transition-colors">
                      {w.serial_number}
                    </span>
                  ))}
                  {batch.wakalat_namas.length > 5 && (
                    <span className="text-xs text-gray-600 flex items-center px-2">
                      + {batch.wakalat_namas.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
