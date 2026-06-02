import { createServerClient } from '@/lib/supabase/server'
import { FeedView } from '@/components/feed/FeedView'

export default async function FeedPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: activeListing }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('listings').select('id').eq('user_id', user!.id).eq('active', true).limit(1).maybeSingle(),
  ])

  return <FeedView profile={profile} isLister={!!activeListing} />
}
