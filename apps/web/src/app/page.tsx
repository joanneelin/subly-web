import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Subly</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/rent/feed" className="text-sm font-semibold text-gray-700 border-2 border-gray-300 px-5 py-2 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all">
                Renter portal
              </Link>
              <Link href="/list/dashboard" className="text-sm font-semibold text-gray-700 border-2 border-gray-300 px-5 py-2 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all">
                Host portal
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-xl mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Campus subletting,<br />made simple.
          </h1>
          <p className="text-lg text-gray-500">
            Find your perfect sublet or list your place — built for students, by students.
          </p>
        </div>

        {/* Portal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          <Link
            href="/rent/feed"
            className="group bg-white rounded-2xl border border-gray-200 p-8 hover:border-brand-400 hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
              <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Find a sublet</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Browse verified listings near campus, matched to your dates and budget.
            </p>
            <div className="mt-4 text-sm font-semibold text-brand-600 group-hover:underline">
              Browse listings →
            </div>
          </Link>

          <Link
            href="/list/dashboard"
            className="group bg-white rounded-2xl border border-gray-200 p-8 hover:border-green-400 hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">List your place</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Post your sublet and connect with verified student renters.
            </p>
            <div className="mt-4 text-sm font-semibold text-green-600 group-hover:underline">
              List now →
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
