import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import DesktopRequiredPage from './desktop-required/page'
import { createAdminClient, createClient } from '@/utils/supabase/server'
import SidebarNav from './SidebarNav'
import MobileNav from '@/components/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Detect platform via custom User Agent sent by Electron
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const isDesktop = userAgent.includes('WakalatDesktop')

  // Use Admin Client to bypass RLS for role fetching to ensure it never fails
  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || user.user_metadata?.role || 'viewer'
  const name = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'

  // PLATFORM GUARD: Admins and SuperAdmins MUST use the desktop app for management/printing.
  // Viewers can use the web browser freely.
  // const isManagementRole = role === 'admin' || role === 'super_admin'
  // if (isManagementRole && !isDesktop) {
  //   return <DesktopRequiredPage />
  // }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col md:flex-row overflow-x-hidden">
      {/* Mobile Nav Header & Drawer */}
      <MobileNav role={role} name={name} />

      {/* Sidebar for Desktop */}
      <div className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-md flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-white/5">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              DBABWN WakalatNamas
            </span>
          </div>
          <SidebarNav role={role} />
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="mb-4 px-3">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${role === 'super_admin' ? 'bg-red-500/10 text-red-400' :
                role === 'admin' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                {role}
              </span>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Dynamic Background Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px] mix-blend-screen pointer-events-none" />

        <main className="p-4 md:p-8 max-w-6xl mx-auto relative z-10 font-[family-name:var(--font-geist-sans)]">
          {children}
        </main>
      </div>
    </div>
  )
}
