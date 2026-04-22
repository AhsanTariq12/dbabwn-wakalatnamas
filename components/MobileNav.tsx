'use client'

import { useState, useEffect } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import SidebarNav from '@/app/dashboard/SidebarNav'
import { usePathname } from 'next/navigation'

interface MobileNavProps {
  role: string
  name: string
}

export default function MobileNav({ role, name }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 md:hidden sticky top-0 z-40 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            DBABWN
          </span>
        </div>
        
        <form action="/auth/signout" method="post">
          <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
        </form>
      </header>

      {/* Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0B] border-r border-white/10 transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full bg-black/20 backdrop-blur-2xl">
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              DBABWN WakalatNamas
            </span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav role={role} />
          </div>

          <div className="p-6 border-t border-white/5 bg-white/[0.02]">
            <div className="mb-4 px-2">
              <p className="text-sm font-medium text-white truncate">{name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  role === 'super_admin' ? 'bg-red-500/10 text-red-400' :
                  role === 'admin' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {role}
                </span>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/10">
                <LogOut size={18} />
                <span className="font-medium">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
