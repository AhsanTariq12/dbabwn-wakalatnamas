'use client'
import { Printer, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react'
import PrintPasswordModal from '@/components/PrintPasswordModal'
import { useEffect, useState } from 'react'

export default function PrintView() {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Desktop-specific state
  const [isDesktop, setIsDesktop] = useState(false)
  const [printers, setPrinters] = useState<any[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState('')

  // Security State
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const WAKALAT_PRICE = 100 // Rs 100 per Wakalat Nama
  const amountPaid = quantity * WAKALAT_PRICE

  useEffect(() => {
    // Check if running inside Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsDesktop(true)
      fetchPrinters()
    }
  }, [])

  async function fetchPrinters() {
    try {
      const printerList = await window.electronAPI.getPrinters()

      // Filter out virtual printers (PDF, XPS, OneNote, etc.)
      const filtered = printerList.filter((p: any) => {
        return ['HP LaserJet Pro M404n', 'Canon LBP6030']
        const name = p.name.toLowerCase()
        const virtualKeywords = ['pdf', 'xps', 'onenote', 'fax', 'microsoft print', 'send to', 'save as']
        return !virtualKeywords.some(keyword => name.includes(keyword))
      })

      setPrinters(filtered)

      // Auto-select default printer if it's in the filtered list
      const defaultPrinter = filtered.find((p: any) => p.isDefault)
      if (defaultPrinter) {
        setSelectedPrinter(defaultPrinter.name)
      } else if (filtered.length > 0) {
        setSelectedPrinter(filtered[0].name)
      }
    } catch (err) {
      console.error('Failed to fetch printers:', err)
    }
  }

  function initiatePrint(e: React.FormEvent) {
    e.preventDefault()

    if (!isDesktop) {
      setError('Printing is disabled on the web. Please use the Desktop Application.')
      return
    }

    if (!selectedPrinter) {
      setError('Please select a printer from the list first.')
      return
    }

    // Open verification modal
    setShowPasswordModal(true)
  }

  async function executePrint() {
    setShowPasswordModal(false)
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 1. Record the batch in Supabase
      const response = await fetch('/api/print-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: quantity,
          amount_paid: amountPaid,
          printer: selectedPrinter
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to record batch in database')
      }

      const data = await response.json()

      // 2. Trigger Silent Print via Electron Bridge
      const templatePath = `/print/template?bcode=${data.bcode}`
      const printResult = await window.electronAPI.printSilently({
        url: templatePath,
        deviceName: selectedPrinter
      })

      if (printResult.success) {
        setSuccess(`Successfully printed Batch ${data.bcode}. Check your printer.`)
        setQuantity(1)
      } else {
        throw new Error(printResult.error || 'Print job failed at the system level.')
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Print New Batch</h1>
          <p className="text-gray-400">Generate secure, uniquely serialized Wakalat Namas.</p>
        </div>
        {!isDesktop && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider animate-pulse">
            <ShieldAlert size={14} /> Local Desktop Required
          </div>
        )}
      </div>

      <div className={`backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] shadow-2xl rounded-3xl p-8 transition-opacity ${!isDesktop ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

        {!isDesktop && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-6 rounded-2xl mb-8 flex items-start gap-4">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-white mb-1">Printing is Locked</p>
              <p className="text-sm opacity-90 leading-relaxed">
                For security and anti-fraud purposes, silent printing is only enabled in our official Desktop App. Please download and install the app to proceed.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in slide-in-from-top-2">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={initiatePrint} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Quantity (Forms)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                required
                disabled={!isDesktop}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Amount to Collect (Rs)
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={`Rs. ${amountPaid.toLocaleString()}`}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/5 text-gray-300 opacity-80 cursor-not-allowed"
                />
                <span className="absolute right-4 top-3.5 text-xs text-gray-500 font-medium bg-black/50 px-2 py-0.5 rounded uppercase">
                  Auto-calculated
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1 flex items-center justify-between">
              <span>Select Desktop Printer</span>
              <button
                type="button"
                onClick={fetchPrinters}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                disabled={!isDesktop}
              >
                Refresh List
              </button>
            </label>
            <select
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
              disabled={!isDesktop || printers.length === 0}
              className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
            >
              {printers.length === 0 ? (
                <option value="">{isDesktop ? 'Detecting printers...' : 'Connect to Desktop App'}</option>
              ) : (
                printers.map((p: any) => (
                  <option key={p.name} value={p.name} className="bg-[#0A0A0B]">
                    {p.name} {p.isDefault ? '(Default)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !isDesktop}
              className={`w-full h-14 font-medium rounded-xl text-white flex items-center justify-center space-x-3 transition-all shadow-lg ${loading || !isDesktop
                ? 'bg-blue-600/30 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-2 focus:ring-blue-500/50 active:scale-[0.98]'
                }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Printing...</span>
                </div>
              ) : (
                <>
                  <Printer size={20} />
                  <span>Execute Printing</span>
                </>
              )}
            </button>
            <p className="mt-4 text-xs text-center text-gray-500 italic">
              * Printing is automated and secure. Ensure printer "{selectedPrinter || '...'}" has Legal paper loaded.
            </p>
          </div>
        </form>
      </div>

      {showPasswordModal && (
        <PrintPasswordModal
          onSuccess={executePrint}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  )
}
