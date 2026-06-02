import Link from 'next/link'
import { timeAgo } from '@/lib/utils'

interface ThreadListProps {
  threads: any[]
  currentUserId: string
}

export function ThreadList({ threads, currentUserId }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="font-medium">No messages yet</p>
        <p className="text-sm mt-1">Message a lister or renter to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {threads.map((thread) => {
        const other = thread.lister_id === currentUserId ? thread.renter : thread.lister
        return (
          <Link
            key={thread.id}
            href={`/messages/${thread.id}`}
            className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gray-100 transition"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {other?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 truncate">{other?.full_name}</span>
                <span className="text-xs text-gray-400 shrink-0 ml-2">{timeAgo(thread.updated_at)}</span>
              </div>
              {thread.listing && (
                <p className="text-xs text-gray-500 truncate">Re: {thread.listing.title || 'Listing'}</p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
