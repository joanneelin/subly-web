import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { MessageThread } from '@/components/messages/MessageThread'

export default async function HostThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: thread } = await supabase
    .from('threads')
    .select(`*, lister:profiles!threads_lister_id_fkey(*), renter:profiles!threads_renter_id_fkey(*), listing:listings(id, title, rent, image_urls)`)
    .eq('id', threadId)
    .single()

  if (!thread) notFound()
  if (thread.lister_id !== user!.id && thread.renter_id !== user!.id) notFound()

  const { data: messages } = await supabase
    .from('messages').select('*').eq('thread_id', threadId).order('created_at', { ascending: true })

  const other = thread.lister_id === user!.id ? thread.renter : thread.lister

  return <MessageThread thread={thread} initialMessages={messages ?? []} currentUserId={user!.id} otherUser={other} basePath="/list/messages" />
}
