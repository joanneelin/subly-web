import { createServerClient } from '@/lib/supabase/server'
import { SettingsView } from '@/components/profile/SettingsView'

export default async function HostSettingsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  return <SettingsView profile={profile} renterPrefs={null} listings={[]} tabs={['profile']} />
}
