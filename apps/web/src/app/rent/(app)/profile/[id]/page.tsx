import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ListingProfileView } from '@/components/profile/ListingProfileView'

export default async function RenterProfilePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ listing?: string }> }) {
  const { id } = await params
  const { listing: listingId } = await searchParams
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!profile) notFound()

  const query = supabase.from('listings').select('*').eq('user_id', id).eq('active', true)
  if (listingId) query.eq('id', listingId)
  const { data: listings } = await query.order('created_at', { ascending: false })
  const listing = listings?.[0] ?? null

  if (!listing) notFound()

  const { data: saves } = user
    ? await supabase.from('saves').select('*').eq('user_id', user.id).eq('saved_listing_id', listing.id).maybeSingle()
    : { data: null }

  return (
    <ListingProfileView
      profile={profile}
      listing={listing}
      currentUserId={user?.id}
      isOwnProfile={user?.id === id}
      isSaved={!!saves}
    />
  )
}
