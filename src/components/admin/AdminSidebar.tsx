"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const navItems = [
  { id: 'dashboard', name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'events', name: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'bookings', name: 'Booking Requests', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  { id: 'host-requests', name: 'Host Requests', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'reviews', name: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
]

export function AdminSidebar({ userEmail, activeTab, onTabChange }: { userEmail: string, activeTab: string, onTabChange: (id: string) => void }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col w-72 bg-surface-elevated/90 backdrop-blur-3xl border-r border-border/50 min-h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center h-24 px-8 border-b border-border/50">
        <div className="text-2xl font-extrabold text-foreground font-manrope tracking-tight cursor-default">
          YogaJam <span className="text-accent text-sm tracking-widest font-medium uppercase ml-1 opacity-80">Admin</span>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto py-8">
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? 'text-foreground bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-border' 
                    : 'text-foreground-secondary hover:text-foreground hover:bg-white/5 border border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full shadow-[0_0_10px_rgba(var(--color-accent),0.8)]" />
                )}
                <svg 
                  className={`flex-shrink-0 mr-4 h-5 w-5 transition-all duration-300 ${
                    isActive ? 'text-accent' : 'text-gray-500 group-hover:text-gray-300'
                  }`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2 : 1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col border-t border-border/50 p-6 bg-black/20">
        <div className="mb-6 px-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Logged in as</p>
          <p className="text-sm font-medium text-gray-300 truncate mt-1.5">{userEmail}</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="group relative flex w-full justify-center items-center px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all duration-300 shadow-sm"
        >
          <svg className="flex-shrink-0 mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out session
        </button>
      </div>
    </div>
  )
}
