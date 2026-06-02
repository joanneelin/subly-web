'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@subletu/types'
import { ListingCard } from './ListingCard'
import { RenterCard } from './RenterCard'
import { FeedFilters, type FeedFilterState } from './FeedFilters'
import { FEED_PAGE_SIZE } from '@subletu/config'

interface FeedViewProps {
  profile: Profile | null
  isLister: boolean
  fixedTab?: 'renter' | 'lister'
}

export function FeedView({ profile, isLister, fixedTab }: FeedViewProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'renter' | 'lister'>(fixedTab ?? 'renter')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<FeedFilterState>({ maxPrice: '', unitType: '', genderPolicy: '', maxBudget: '' })

  const loadFeed = useCallback(async (reset = false) => {
    if (!profile) return
    setLoading(true)
    const offset = reset ? 0 : page * FEED_PAGE_SIZE

    let data: any[] = []
    let error = null

    if (activeTab === 'renter') {
      // Run both fetches in parallel: own listings (direct table) + everyone else (RPC)
      const [ownRes, rpcRes] = await Promise.all([
        reset
          ? supabase.from('listings').select('*').eq('user_id', profile.id).eq('active', true)
          : Promise.resolve({ data: [] as any[] }),
        supabase.rpc('get_renter_feed', {
          p_user_id: profile.id,
          p_limit: FEED_PAGE_SIZE,
          p_offset: offset,
        }),
      ])

      error = rpcRes.error
      const others: any[] = rpcRes.data ?? []
      const own: any[] = (ownRes.data ?? []).map((l: any) => ({ ...l, match_score: null }))
      const othersIds = new Set(others.map((d: any) => d.id))
      // Own listings first, then others (deduplicated in case SQL was already patched)
      data = [...own.filter((l: any) => !othersIds.has(l.id)), ...others]
      error = null // own listings always succeed; don't block on RPC error
    } else {
      const { data: listings } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', profile.id)
        .eq('active', true)
        .limit(1)
        .single()

      if (listings?.id) {
        const res = await supabase.rpc('get_lister_feed', {
          p_user_id: profile.id,
          p_listing_id: listings.id,
          p_limit: FEED_PAGE_SIZE,
          p_offset: offset,
        })
        data = res.data ?? []
        error = res.error
      }
    }

    if (!error) {
      setItems((prev) => reset ? data : [...prev, ...data])
      setHasMore(data.length === FEED_PAGE_SIZE)
      if (!reset) setPage((p) => p + 1)
    }

    setLoading(false)
  }, [profile, activeTab, page, supabase])

  useEffect(() => {
    setPage(0)
    loadFeed(true)
  }, [activeTab])

  const filteredItems = items.filter((item) => {
    if (activeTab === 'renter') {
      if (filters.maxPrice && item.rent > Number(filters.maxPrice)) return false
      if (filters.unitType && item.unit_type !== filters.unitType) return false
      if (filters.genderPolicy && item.gender_preference !== filters.genderPolicy) return false
    } else {
      if (filters.maxBudget && item.rent_max > Number(filters.maxBudget)) return false
    }
    return true
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'renter' ? 'Find a sublet' : 'Find renters'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeTab === 'renter'
              ? 'Browse available listings matched to your preferences.'
              : 'Renters looking for places like yours.'}
          </p>
        </div>

        {isLister && !fixedTab && (
          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
            <button
              onClick={() => setActiveTab('renter')}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'renter' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab('lister')}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'lister' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Renters
            </button>
          </div>
        )}
      </div>

      <FeedFilters mode={activeTab} filters={filters} onChange={setFilters} />

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="font-medium">No results found</p>
          <p className="text-sm mt-1">Try adjusting your filters or preferences.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeTab === 'renter'
              ? filteredItems.map((item) => <ListingCard key={item.id} listing={item} />)
              : filteredItems.map((item) => <RenterCard key={item.id} renter={item} />)}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => loadFeed(false)}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-brand-600 border border-brand-300 rounded-xl hover:bg-brand-50 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
