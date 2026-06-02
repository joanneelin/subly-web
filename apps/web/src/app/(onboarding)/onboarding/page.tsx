import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('renter_preferences').select('id').eq('user_id', user.id).maybeSingle(),
  ])

  // If they already have a name or saved preferences, skip onboarding
  if (profile?.full_name || prefs) redirect('/rent/feed')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <OnboardingWizard />
    </div>
  )
}
