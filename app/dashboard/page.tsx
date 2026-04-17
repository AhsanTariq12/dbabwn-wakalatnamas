"use client"
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Printer, FileText, TrendingUp, Loader2, Calendar, BarChart3, ChevronRight, Shield } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalForms: 0, totalRevenue: 0, batchesToday: 0, formsToday: 0 })
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string>('viewer')

  // Helpers to ensure Pakistan Time (+05:00) consistency
  const PAKISTAN_OFFSET = 5 * 60 * 60 * 1000;

  const getLocalDateString = (date: Date) => {
    // Force to Pakistan time for date calculation
    const pakDate = new Date(date.getTime() + PAKISTAN_OFFSET);
    return pakDate.toISOString().split('T')[0];
  };

  const getLocalMonthString = (date: Date) => {
    const pakDate = new Date(date.getTime() + PAKISTAN_OFFSET);
    return pakDate.toISOString().slice(0, 7); // YYYY-MM
  };

  const getLocalYearString = (date: Date) => {
    const pakDate = new Date(date.getTime() + PAKISTAN_OFFSET);
    return pakDate.getUTCFullYear().toString(); // Use UTC because we added the offset
  };

  // Filter States - Default to local "Today"
  const [selectedDay, setSelectedDay] = useState(getLocalDateString(new Date()))
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonthString(new Date()))
  const [selectedYear, setSelectedYear] = useState(getLocalYearString(new Date()))

  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Prioritize user_metadata for immediate client-side UI feedback
          const metadataRole = user.user_metadata?.role
          if (metadataRole) setRole(metadataRole)

          // Still check the database for the source of truth
          const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
          if (profile) setRole(profile.role)
        }

        const { data: batchesData } = await supabase.from('batches').select('quantity, amount_paid, created_at, batch_code')

        if (batchesData) {
          const totalForms = batchesData.reduce((acc, b) => acc + b.quantity, 0)
          const totalRevenue = batchesData.reduce((acc, b) => acc + (b.amount_paid || 0), 0)

          const todayStr = getLocalDateString(new Date())
          const todayBatches = batchesData.filter(b => getLocalDateString(new Date(b.created_at)) === todayStr)

          const batchesToday = todayBatches.length
          const formsToday = todayBatches.reduce((acc, b) => acc + b.quantity, 0)

          setBatches(batchesData)
          setStats({ totalForms, totalRevenue, batchesToday, formsToday })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const filteredDayIncome = useMemo(() => {
    return batches
      .filter(b => getLocalDateString(new Date(b.created_at)) === selectedDay)
      .reduce((acc, b) => acc + (b.amount_paid || 0), 0)
  }, [batches, selectedDay])

  const filteredMonthIncome = useMemo(() => {
    return batches
      .filter(b => getLocalMonthString(new Date(b.created_at)) === selectedMonth)
      .reduce((acc, b) => acc + (b.amount_paid || 0), 0)
  }, [batches, selectedMonth])

  const filteredYearIncome = useMemo(() => {
    return batches
      .filter(b => {
        if (selectedYear === 'all') return true;
        return getLocalYearString(new Date(b.created_at)) === selectedYear;
      })
      .reduce((acc, b) => acc + (b.amount_paid || 0), 0)
  }, [batches, selectedYear])

  const availableYears = useMemo(() => {
    const years = new Set(batches.map(b => getLocalYearString(new Date(b.created_at))));
    // Ensure current year is always an option even if no batches yet
    years.add(getLocalYearString(new Date()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [batches])

  const recentBatches = useMemo(() => {
    return [...batches].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3)
  }, [batches])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Track and analyze your printing operations.</p>
        </div>
      </div>

      {/* Analytical Filters */}
      <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/10 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Calendar size={18} />
            </div>
            <span className="text-sm font-medium text-gray-300">Income Filter:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 uppercase tracking-wider pointer-events-none">Day</span>
              <input
                type="date"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="h-10 pl-11 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium"
              />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500 uppercase tracking-wider pointer-events-none">Month</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-10 pl-14 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-medium"
              />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-500 uppercase tracking-wider pointer-events-none">Year</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-10 pl-12 pr-8 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium appearance-none cursor-pointer"
              >
                {availableYears.map(year => (
                  <option key={year} value={year} className="bg-[#0A0A0B]">{year}</option>
                ))}
                <option value="all" className="bg-[#0A0A0B]">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Filtered Day Income */}
        <div className="p-5 rounded-xl bg-blue-600/5 border border-blue-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent transition-opacity" />
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest relative z-10 mb-1">Income (Day)</p>
          <p className="text-xl font-bold text-white relative z-10">Rs {loading ? '...' : filteredDayIncome.toLocaleString()}</p>
          <div className="mt-3 flex items-center text-[9px] text-gray-500 relative z-10 bg-black/20 w-fit px-1.5 py-0.5 rounded">
            {new Date(selectedDay).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </div>
        </div>

        {/* Filtered Month Income */}
        <div className="p-5 rounded-xl bg-emerald-600/5 border border-emerald-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent transition-opacity" />
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest relative z-10 mb-1">Income (Month)</p>
          <p className="text-xl font-bold text-white relative z-10">Rs {loading ? '...' : filteredMonthIncome.toLocaleString()}</p>
          <div className="mt-3 flex items-center text-[9px] text-gray-500 relative z-10 bg-black/20 w-fit px-1.5 py-0.5 rounded">
            {new Date(selectedMonth).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Filtered Year Income */}
        <div className="p-5 rounded-xl bg-indigo-600/5 border border-indigo-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent transition-opacity" />
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest relative z-10 mb-1">
            {selectedYear === 'all' ? 'Income (All Time)' : `Income (Year ${selectedYear})`}
          </p>
          <p className="text-xl font-bold text-white relative z-10">Rs {loading ? '...' : filteredYearIncome.toLocaleString()}</p>
          <div className="mt-3 flex items-center text-[9px] text-gray-500 relative z-10 bg-black/20 w-fit px-1.5 py-0.5 rounded">
            {selectedYear === 'all' ? 'Cumulative' : selectedYear}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest relative z-10 mb-1">Forms Lifetime</p>
          <p className="text-xl font-bold text-white relative z-10">{loading ? '...' : stats.totalForms.toLocaleString()}</p>
          <div className="mt-3 p-1 rounded bg-purple-500/20 text-purple-400 w-fit">
            <BarChart3 size={12} />
          </div>
        </div>

        {/* Forms Printed Today */}
        <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent transition-opacity" />
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest relative z-10 mb-1">Printed Today</p>
          <p className="text-xl font-bold text-white relative z-10">{loading ? '...' : stats.formsToday} Forms</p>
          <div className="mt-3 p-1 rounded bg-amber-500/20 text-amber-500 w-fit">
            <Printer size={12} />
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Print Operations</h2>
            <Link href="/dashboard/ledger" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 group">
              View full ledger <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
            {loading ? (
              <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-gray-600" /></div>
            ) : recentBatches.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentBatches.map(batch => (
                  <div key={batch.batch_code} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Batch {batch.batch_code}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{batch.quantity} forms</span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-xs text-gray-500 font-mono">{new Date(batch.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">Rs {batch.amount_paid?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p>No batches printed yet.</p>
              </div>
            )}
          </div>
        </div>
        {role !== 'viewer' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Management</h2>

            <Link
              href="/dashboard/print"
              className="block p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-white/5 hover:border-blue-500/40 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                  <Printer size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Print New Batch</h3>
                  <p className="text-sm text-gray-400 mt-1">Generate secured forms</p>
                </div>
              </div>
            </Link>



            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <Shield size={14} /> Total System Load
              </div>
              <p className="text-sm text-gray-400">Today you have handled <span className="text-white font-bold">{stats.batchesToday}</span> batches.</p>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

