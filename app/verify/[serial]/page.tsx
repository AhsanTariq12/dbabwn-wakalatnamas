import { verifyWakalatNamaAction } from '@/app/actions/verify'
import { CheckCircle2, XCircle, ShieldCheck, Printer, Calendar, Coins } from 'lucide-react'
import { format } from 'date-fns'

export default async function VerifyPage({ params }: { params: Promise<{ serial: string }> }) {
  const resolvedParams = await params
  const decodedSerial = decodeURIComponent(resolvedParams.serial)

  const result = await verifyWakalatNamaAction(decodedSerial)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">

      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm mb-4">
          <img src="/logo.png" alt="DBA BWN Logo" className="w-14 h-14" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center">District Bar Association</h1>
        <h2 className="text-lg text-gray-600 font-medium">Bahawalnagar</h2>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

        {result.valid ? (
          // VALID UI
          <div className="flex flex-col">
            <div className="bg-green-500 p-8 flex flex-col items-center justify-center text-white">
              <ShieldCheck className="w-20 h-20 mb-4 animate-pulse" />
              <h2 className="text-3xl font-black tracking-tight">AUTHENTIC</h2>
              <p className="text-green-100 font-medium mt-1">Official Wakalat Nama</p>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Serial Number</p>
                <p className="text-lg font-mono font-bold text-gray-900 break-all">{decodedSerial}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Printed On</p>
                    <p className="text-gray-900 font-bold">
                      {result.created_at ? format(new Date(result.created_at), 'PPPPp') : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Authorized Printer</p>
                    <p className="text-gray-900 font-bold">{result.printer_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Amount Paid</p>
                    <p className="text-gray-900 font-bold">Rs. {result.amount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // INVALID UI
          <div className="flex flex-col">
            <div className="bg-red-500 p-8 flex flex-col items-center justify-center text-white">
              <XCircle className="w-20 h-20 mb-4" />
              <h2 className="text-3xl font-black tracking-tight">INVALID</h2>
              <p className="text-red-100 font-medium mt-1">Suspected Forgery</p>
            </div>

            <div className="p-6 flex flex-col gap-4 items-center text-center">
              <p className="text-gray-600 font-medium">
                {result.error || "This serial number could not be found in our official database."}
              </p>

              <div className="bg-red-50 p-4 rounded-xl border border-red-100 w-full mt-2">
                <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-1">Scanned Serial</p>
                <p className="text-md font-mono font-bold text-red-900 break-all">{decodedSerial}</p>
              </div>

              <p className="text-sm text-gray-400 mt-2">
                If you believe this is an error, please contact the District Bar Association office immediately.
              </p>
            </div>
          </div>
        )}

      </div>

      <div className="mt-8 text-center text-gray-400 text-sm font-medium">
        Secure Verification System <br />
        © {new Date().getFullYear()} DBA Bahawalnagar
      </div>

    </div>
  )
}
