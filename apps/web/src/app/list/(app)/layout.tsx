import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { HostNav } from '@/components/layout/HostNav'

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in?next=/list/dashboard')

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase.from('profiles').select('full_name, school_email').eq('id', user.id).single(),
    supabase.from('renter_preferences').select('id').eq('user_id', user.id).maybeSingle(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <HostNav
        name={profile?.full_name ?? ''}
        email={profile?.school_email ?? user.email ?? ''}
        hasRenterAccount={!!prefs}
      />
      <main className="md:ml-60 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
