import { createServerClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/feed/ListingCard'

export default async function SavedPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: saves } = await supabase
    .from('saves')
    .select(`
      *,
      listing:listings(*)
    `)
    .eq('user_id', user!.id)
    .not('saved_listing_id', 'is', null)
    .order('created_at', { ascending: false })

  const listings = saves?.map((s) => s.listing).filter(Boolean) ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved</h1>
      <p className="text-sm text-gray-500 mb-6">{listings.length} saved listing{listings.length !== 1 ? 's' : ''}</p>

      {listings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="font-medium">No saved listings</p>
          <p className="text-sm mt-1">Bookmark listings from the feed to save them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={{ ...listing, match_score: 0, profiles: null as any }} />
          ))}
        </div>
      )}
    </div>
  )
}
