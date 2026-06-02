import { createServerClient } from '@/lib/supabase/server'
import { FeedView } from '@/components/feed/FeedView'

export default async function RenterFeedPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  return <FeedView profile={profile} isLister={false} />
}
