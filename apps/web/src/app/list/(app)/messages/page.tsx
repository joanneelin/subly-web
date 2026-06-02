import { createServerClient } from '@/lib/supabase/server'
import { MessagesInbox } from '@/components/messages/MessagesInbox'

export default async function HostMessagesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: threads } = await supabase
    .from('threads')
    .select(`*, lister:profiles!threads_lister_id_fkey(*), renter:profiles!threads_renter_id_fkey(*), listing:listings(id, title, rent, image_urls)`)
    .or(`lister_id.eq.${user!.id},renter_id.eq.${user!.id}`)
    .order('updated_at', { ascending: false })

  return (
    <div className="max-w-lg mx-auto h-screen">
      <MessagesInbox threads={threads ?? []} currentUserId={user!.id} basePath="/list/messages" portal="list" />
    </div>
  )
}
