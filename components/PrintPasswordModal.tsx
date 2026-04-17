'use client'

import { useState } from 'react'
import { ShieldCheck, Lock, X } from 'lucide-react'
import { verifyPasswordAction } from '@/app/actions/auth'

interface PrintPasswordModalProps {
  onSuccess: (password: string) => void
  onCancel: () => void
}

export default function PrintPasswordModal({ onSuccess, onCancel }: PrintPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setIsVerifying(true)
    setError('')

    try {
      const result = await verifyPasswordAction(password)
      if (result.success) {
        onSuccess(password)
      } else {
        setError(result.error || 'Identity verification failed.')
      }
    } catch (err: any) {
      setError('A system error occurred. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-[#0F0F11] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security Verification</h2>
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-medium">Re-authentication Required</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">
              Confirm Account Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your login password"
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center text-sm font-medium animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
               type="button"
               onClick={onCancel}
               className="h-12 rounded-xl border border-white/5 hover:bg-white/[0.02] text-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className={`h-12 font-bold rounded-xl text-white flex items-center justify-center space-x-2 transition-all shadow-lg ${isVerifying
                  ? 'bg-blue-600/50 grayscale cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
                }`}
            >
              {isVerifying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Verify Identity</span>
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-xs text-center text-gray-500">
          This extra step protects the system if your computer is left unattended.
        </p>
      </div>
    </div>
  )
}
