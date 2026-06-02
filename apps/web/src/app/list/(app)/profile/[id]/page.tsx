import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { RenterProfileView } from '@/components/profile/RenterProfileView'

export default async function HostProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', params.id).single()
  if (!profile) notFound()

  const { data: renterPrefs } = await supabase
    .from('renter_preferences').select('*').eq('user_id', params.id).maybeSingle()

  return (
    <RenterProfileView
      profile={profile}
      renterPrefs={renterPrefs}
      currentUserId={user?.id}
      isOwnProfile={user?.id === params.id}
    />
  )
}
