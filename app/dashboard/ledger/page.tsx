'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, Loader2, Calendar, User, FileDigit, RotateCcw, Download } from 'lucide-react'
import Link from 'next/link'

export default function LedgerPage() {
  const PAGE_SIZE = 5
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  // Filter States
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [stats, setStats] = useState({ totalBatches: 0, totalForms: 0 })


  const supabase = createClient()

  // Helper to apply current filters to any Supabase query
  const applyFilters = (req: any) => {
    if (selectedDay) {
      return req.gte('created_at', `${selectedDay}T00:00:00+05:00`).lte('created_at', `${selectedDay}T23:59:59+05:00`)
    } else if (selectedMonth) {
      const [year, month] = selectedMonth.split('-')
      const firstDay = `${selectedMonth}-01T00:00:00+05:00`
      const lastDayStr = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]
      const lastDay = `${lastDayStr}T23:59:59+05:00`
      return req.gte('created_at', firstDay).lte('created_at', lastDay)
    } else if (selectedYear && selectedYear !== 'all') {
      return req.gte('created_at', `${selectedYear}-01-01T00:00:00+05:00`).lte('created_at', `${selectedYear}-12-31T23:59:59+05:00`)
    }
    return req
  }

  // Fetch unique years for the filter
  useEffect(() => {
    async function fetchYears() {
      const { data } = await supabase.from('batches').select('created_at').eq('status', 'printed')
      if (data) {
        const years = Array.from(new Set(data.map(b => new Date(b.created_at).getFullYear().toString()))).sort((a, b) => b.localeCompare(a))
        setAvailableYears(years)
      }
    }
    fetchYears()
  }, [])

  // Reset and fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0)
      fetchBatches(0, search, true)
    }, 400) // Debounce search
    return () => clearTimeout(timer)
  }, [search, selectedDay, selectedMonth, selectedYear])

  async function fetchBatches(targetPage: number, query = '', reset = false) {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadMoreLoading(true)
      }

      // We prioritize Search if it exists (Global Search as requested)
      if (query) {
        const isNumeric = /^\d+$/.test(query)
        if (!isNumeric) {
          setBatches([])
          setStats({ totalBatches: 0, totalForms: 0 })
          setHasMore(false)
          setLoading(false)
          return
        }

        const serialNum = parseInt(query)

        // Directly find batches where the serial number falls within the stored range
        let request = supabase
          .from('batches')
          .select('*, wakalat_namas(serial_number), users(name)')
          .eq('status', 'printed')
          .lte('serial_start', serialNum)
          .gte('serial_end', serialNum)
          .order('created_at', { ascending: false })

        const { data, error } = await request
        if (error) throw error

        // In Search mode, we just show all matches (usually small set)
        setBatches(data || [])
        setHasMore(false) // Disable load more in global search mode

        // Calculate Search Stats
        const searchForms = data?.reduce((acc: number, b: any) => acc + (b.quantity || 0), 0) || 0
        setStats({ totalBatches: data?.length || 0, totalForms: searchForms })

      } else {
        // Date Filtering Mode (Standard Pagination)
        let request = supabase
          .from('batches')
          .select('*, wakalat_namas(serial_number), users(name)', { count: 'exact' })
          .eq('status', 'printed')
          .order('created_at', { ascending: false })

        // Apply Date Filters (re-using the logic for the count/sum too)
        const applyFilters = (req: any) => {
          if (selectedDay) {
            return req.gte('created_at', `${selectedDay}T00:00:00+05:00`).lte('created_at', `${selectedDay}T23:59:59+05:00`)
          } else if (selectedMonth) {
            const [year, month] = selectedMonth.split('-')
            const firstDay = `${selectedMonth}-01T00:00:00+05:00`
            const lastDayStr = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]
            const lastDay = `${lastDayStr}T23:59:59+05:00`
            return req.gte('created_at', firstDay).lte('created_at', lastDay)
          } else if (selectedYear && selectedYear !== 'all') {
            return req.gte('created_at', `${selectedYear}-01-01T00:00:00+05:00`).lte('created_at', `${selectedYear}-12-31T23:59:59+05:00`)
          }
          return req
        }

        request = applyFilters(request)

        const from = targetPage * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        request = request.range(from, to)

        const { data, error, count } = await request as any
        if (error) throw error

        if (reset) {
          setBatches(data || [])

          // Get total forms sum for date mode (only on reset to save requests)
          let sumReq = supabase.from('batches').select('quantity').eq('status', 'printed')
          sumReq = applyFilters(sumReq)
          const { data: sumData } = await sumReq
          const totalForms = sumData?.reduce((acc: number, b: any) => acc + (b.quantity || 0), 0) || 0
          setStats({ totalBatches: count || 0, totalForms })
        } else {
          setBatches(prev => [...prev, ...(data || [])])
        }

        setHasMore(count ? (targetPage + 1) * PAGE_SIZE < count : false)
      }

    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
      setLoadMoreLoading(false)
    }
  }

  async function handleExportCSV() {
    try {
      setIsExporting(true)
      let allData: any[] = []

      // Re-run the filter logic without pagination to get FULL data
      if (search) {
        const { data: serialMatches } = await supabase.from('wakalat_namas').select('batch_id').ilike('serial_number', `%${search}`)
        const matchedIds = Array.from(new Set(serialMatches?.map(s => s.batch_id) || []))
        let request = supabase.from('batches').select('*, wakalat_namas(serial_number)').eq('status', 'printed').order('created_at', { ascending: false })
        if (matchedIds.length > 0) request = request.or(`batch_code.ilike.%${search}%,id.in.(${matchedIds.join(',')})`)
        else request = request.ilike('batch_code', `%${search}%`)
        const { data } = await request
        allData = data || []
      } else {
        let request = supabase.from('batches').select('*, wakalat_namas(serial_number)').eq('status', 'printed').order('created_at', { ascending: false })
        request = applyFilters(request)
        const { data } = await request
        allData = data || []
      }

      if (allData.length === 0) {
        alert('No data to export.')
        return
      }

      // Build CSV
      const headers = ['Date', 'Time', 'Batch Code', 'Quantity', 'Amount Paid (Rs)', 'Printer Name', 'Serial Start', 'Serial End']
      const rows = allData.map(b => [
        new Date(b.created_at).toLocaleDateString(),
        new Date(b.created_at).toLocaleTimeString(),
        b.batch_code,
        b.quantity,
        b.amount_paid,
        b.printer_name || 'Unknown',
        b.serial_start,
        b.serial_end
      ])

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `wakalat_nama_audit_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBatches(nextPage, search, false)
  }

  function resetFilters() {
    setSearch('')
    setSelectedDay('')
    setSelectedMonth('')
    setSelectedYear('')
    setPage(0)
  }

  const displayBatches = batches;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Print Ledger</h1>
          <p className="text-gray-400">Track and verify all issued Wakalat Nama batches.</p>
        </div>

        {/* Dynamic Summary Card */}
        <div className="flex items-center gap-4 animate-in fade-in zoom-in duration-700">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FileDigit size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-0.5">Forms Verified</p>
              <p className="text-xl font-mono font-bold text-white">{stats.totalForms.toLocaleString()}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-0.5">Total Batches</p>
              <p className="text-xl font-mono font-bold text-white">{stats.totalBatches.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search last digits of serial or batch code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${selectedMonth || selectedYear ? 'text-gray-600' : 'text-blue-500'} uppercase tracking-wider pointer-events-none transition-colors`}>Day</span>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              disabled={!!(selectedMonth || selectedYear)}
              className="h-10 pl-11 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>

          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${selectedDay || selectedYear ? 'text-gray-600' : 'text-emerald-500'} uppercase tracking-wider pointer-events-none transition-colors`}>Month</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={!!(selectedDay || selectedYear)}
              className="h-10 pl-14 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            />
          </div>

          <div className="relative">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${selectedDay || selectedMonth ? 'text-gray-600' : 'text-indigo-500'} uppercase tracking-wider pointer-events-none transition-colors`}>Year</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!!(selectedDay || selectedMonth)}
              className="h-10 pl-12 pr-8 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs font-medium appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <option value="" className="bg-[#0A0A0B]">Select Year</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr} className="bg-[#0A0A0B]">{yr}</option>
              ))}
              <option value="all" className="bg-[#0A0A0B]">All Time</option>
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="h-10 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            title="Clear all filters"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting || batches.length === 0}
            className="h-10 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ml-auto xl:ml-0"
            title="Export filtered data to CSV"
          >
            {isExporting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading history...</p>
          </div>
        ) : displayBatches.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border border-white/5 rounded-3xl bg-white/[0.01]">
            <Search className="mx-auto mb-4 opacity-20" size={48} />
            <p className="text-lg font-medium text-gray-400">No records found</p>
            <p className="text-sm opacity-60 mt-1">Try adjusting your filters or search digits.</p>
            <button
              onClick={resetFilters}
              className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-bold uppercase tracking-widest"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {displayBatches.map((batch) => (
              <div
                key={batch.id}
                className="group p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all"
              >
                {/* ... existing batch card content ... */}
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
                        {batch.printer_name && (
                          <span className="flex items-center gap-1.5 border border-blue-500/10 px-2 py-0.5 rounded-md bg-blue-500/5 text-blue-400/80">
                            <Loader2 size={12} className={batch.printer_name !== 'Unknown' ? '' : 'animate-pulse'} />
                            {batch.printer_name}
                          </span>
                        )}
                        {batch.users?.name && (
                          <span className="flex items-center gap-1.5 border border-purple-500/10 px-2 py-0.5 rounded-md bg-purple-500/5 text-purple-400/80" title="Printed By">
                            <User size={12} />
                            {batch.users.name.length > 2 
                              ? batch.users.name.slice(0, -2) + '**' 
                              : batch.users.name.charAt(0) + '*'}
                          </span>
                        )}
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
            ))}

            {hasMore && (
              <div className="pt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadMoreLoading}
                  className="px-8 h-14 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-bold hover:bg-white/[0.05] hover:border-white/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loadMoreLoading ? (
                    <Loader2 className="animate-spin text-blue-400" size={20} />
                  ) : (
                    <FileDigit className="text-blue-400 group-hover:scale-110 transition-transform" size={20} />
                  )}
                  <span>{loadMoreLoading ? 'Fetching More Batches...' : 'Load 5 More Batches'}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>


  )
}
