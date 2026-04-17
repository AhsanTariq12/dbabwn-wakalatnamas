'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, LayoutDashboard, Users } from 'lucide-react'

export default function SidebarNav({ role }: { role: string }) {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Verify', href: '/dashboard/ledger', icon: FileText },
    { name: 'Users', href: '/dashboard/users', icon: Users, restricted: true },
  ]

  return (
    <nav className="p-4 space-y-1">
      {links.map((link) => {
        // Skip restricted links if not superadmin
        if (link.restricted && role !== 'super_admin') return null;

        const Icon = link.icon
        const isActive = link.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname?.startsWith(link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
          >
            <Icon size={18} />
            <span>{link.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
