import { createServerClient } from '@/lib/supabase/server'
import { SettingsView } from '@/components/profile/SettingsView'

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: renterPrefs }, { data: listings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('renter_preferences').select('*').eq('user_id', user!.id).maybeSingle(),
    supabase.from('listings').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
  ])

  return <SettingsView profile={profile} renterPrefs={renterPrefs} listings={listings ?? []} />
}
