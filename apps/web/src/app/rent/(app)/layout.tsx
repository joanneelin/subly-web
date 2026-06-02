import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { RenterNav } from '@/components/layout/RenterNav'

export default async function RenterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in?next=/rent/feed')

  const [{ data: profile }, { data: prefs }, { data: listing }] = await Promise.all([
    supabase.from('profiles').select('full_name, school_email').eq('id', user.id).single(),
    supabase.from('renter_preferences').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('listings').select('id').eq('user_id', user.id).limit(1).maybeSingle(),
  ])

  // Send to onboarding if they haven't set up renter preferences yet
  if (!prefs && !profile?.full_name) redirect('/rent/onboarding')

  return (
    <div className="min-h-screen bg-gray-50">
      <RenterNav
        name={profile?.full_name ?? ''}
        email={profile?.school_email ?? user.email ?? ''}
        hasHostAccount={!!listing}
      />
      <main className="md:ml-60 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
