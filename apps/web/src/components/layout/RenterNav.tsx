'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AccountSwitcher } from './AccountSwitcher'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    href: '/rent/feed',
    label: 'Discover',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/rent/saved',
    label: 'Saved',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    href: '/rent/messages',
    label: 'Messages',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: '/rent/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

interface RenterNavProps {
  name: string
  email: string
  hasHostAccount: boolean
}

export function RenterNav({ name, email, hasHostAccount }: RenterNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 p-4 z-40">
        <Link href="/rent/feed" className="flex items-center gap-2 mb-8 px-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Subly" className="h-8 w-auto" />
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full">Renter</span>
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
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        <AccountSwitcher name={name} email={email} currentPortal="rent" hasOtherPortal={hasHostAccount} />
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
                pathname.startsWith(item.href) ? 'text-brand-700' : 'text-gray-500'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className="relative flex flex-col items-center">
            <AccountSwitcher name={name} email={email} currentPortal="rent" hasOtherPortal={hasHostAccount} />
          </div>
        </div>
      </nav>
    </>
  )
}
