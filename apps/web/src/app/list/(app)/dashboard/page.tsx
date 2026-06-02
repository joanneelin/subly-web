import { createServerClient } from '@/lib/supabase/server'
import { SettingsView } from '@/components/profile/SettingsView'

export default async function HostDashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: listings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('listings').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
  ])

  return <SettingsView profile={profile} renterPrefs={null} listings={listings ?? []} defaultTab="listings" tabs={['listings']} />
}
