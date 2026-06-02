import { createServerClient } from '@/lib/supabase/server'
import { ThreadList } from '@/components/messages/ThreadList'

export default async function MessagesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: threads } = await supabase
    .from('threads')
    .select(`
      *,
      lister:profiles!threads_lister_id_fkey(*),
      renter:profiles!threads_renter_id_fkey(*),
      listing:listings(id, title, rent, image_urls)
    `)
    .or(`lister_id.eq.${user!.id},renter_id.eq.${user!.id}`)
    .order('updated_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <ThreadList threads={threads ?? []} currentUserId={user!.id} />
    </div>
  )
}
