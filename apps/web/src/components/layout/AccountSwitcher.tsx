'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AccountSwitcherProps {
  name: string
  email: string
  currentPortal: 'rent' | 'list'
  hasOtherPortal: boolean
}

export function AccountSwitcher({ name, email, currentPortal, hasOtherPortal }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const otherHref = currentPortal === 'rent' ? '/list/dashboard' : '/rent/feed'
  const switchLabel = currentPortal === 'rent' ? 'Switch to Host account' : 'Switch to Renter account'
  const createLabel = currentPortal === 'rent' ? 'Create Host account' : 'Create Renter account'
  const currentLabel = currentPortal === 'rent' ? 'Renter account' : 'Host account'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all w-full"
        title="Account menu"
      >
        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {name ? name[0].toUpperCase() : '?'}
        </div>
        <span className="truncate">{name || 'Account'}</span>
        <svg className="w-4 h-4 ml-auto shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Popup */}
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
            {/* Account info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0">
                  {name ? name[0].toUpperCase() : '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{name || 'Your account'}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
              </div>
              <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                {currentLabel}
              </span>
            </div>

            {/* Actions */}
            <div className="py-1">
              <Link
                href={otherHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {hasOtherPortal ? (
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {hasOtherPortal ? switchLabel : createLabel}
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left border-t border-gray-100"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
