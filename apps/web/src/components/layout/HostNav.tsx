'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AccountSwitcher } from './AccountSwitcher'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    href: '/list/dashboard',
    label: 'My Listings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/list/renters',
    label: 'Find Renters',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/list/messages',
    label: 'Messages',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: '/list/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

interface HostNavProps {
  name: string
  email: string
  hasRenterAccount: boolean
}

export function HostNav({ name, email, hasRenterAccount }: HostNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 p-4 z-40">
        <Link href="/list/dashboard" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900">Subly</span>
            <span className="ml-2 text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">Host</span>
          </div>
        </Link>

        <div className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname.startsWith(item.href)
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        <AccountSwitcher name={name} email={email} currentPortal="list" hasOtherPortal={hasRenterAccount} />
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                pathname.startsWith(item.href) ? 'text-green-700' : 'text-gray-500'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className="relative flex flex-col items-center">
            <AccountSwitcher name={name} email={email} currentPortal="list" hasOtherPortal={hasRenterAccount} />
          </div>
        </div>
      </nav>
    </>
  )
}
