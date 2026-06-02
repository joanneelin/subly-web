'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'

interface MessagesInboxProps {
  threads: any[]
  currentUserId: string
  basePath: string
  portal: 'rent' | 'list'
}

export function MessagesInbox({ threads, currentUserId, basePath, portal }: MessagesInboxProps) {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  const filteredThreads = threads.filter((thread) => {
    if (!search.trim()) return true
    const other = thread.lister_id === currentUserId ? thread.renter : thread.lister
    return other?.full_name?.toLowerCase().includes(search.toLowerCase())
  })

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${search}%`)
        .neq('id', currentUserId)
        .limit(8)
      setSearchResults(data ?? [])
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, supabase, currentUserId])

  const handleNewThread = async (profileId: string) => {
    const { data: existing } = await supabase
      .from('threads')
      .select('id')
      .or(`and(lister_id.eq.${profileId},renter_id.eq.${currentUserId}),and(lister_id.eq.${currentUserId},renter_id.eq.${profileId})`)
      .maybeSingle()

    if (existing) {
      router.push(`${basePath}/${existing.id}`)
      return
    }

    const insertData = portal === 'rent'
      ? { lister_id: profileId, renter_id: currentUserId }
      : { lister_id: currentUserId, renter_id: profileId }

    const { data: thread } = await supabase
      .from('threads')
      .insert(insertData)
      .select('id')
      .single()

    if (thread) router.push(`${basePath}/${thread.id}`)
  }

  const existingIds = new Set(threads.map((t) => {
    const other = t.lister_id === currentUserId ? t.renter : t.lister
    return other?.id
  }))
  const newPeople = searchResults.filter((p) => !existingIds.has(p.id))
  const isSearching = search.trim().length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-3 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => document.getElementById('msg-search')?.focus()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3.5 py-2.5">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="msg-search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent flex-1 text-sm outline-none placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* New people from search */}
        {isSearching && newPeople.length > 0 && (
          <div className="mb-1">
            <p className="px-5 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">People</p>
            {newPeople.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleNewThread(profile.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition text-left"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{profile.full_name}</p>
                  <p className="text-xs text-gray-400">Tap to message</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Section label when showing both search results + threads */}
        {isSearching && filteredThreads.length > 0 && (
          <p className="px-5 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Conversations</p>
        )}

        {/* Thread list */}
        {filteredThreads.map((thread) => {
          const other = thread.lister_id === currentUserId ? thread.renter : thread.lister
          return (
            <Link
              key={thread.id}
              href={`${basePath}/${thread.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {other?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900 text-sm truncate">{other?.full_name ?? 'Unknown'}</span>
                  <span className="text-xs text-gray-400 shrink-0">{timeAgo(thread.updated_at)}</span>
                </div>
                <p className="text-sm text-gray-400 truncate mt-0.5">
                  {thread.listing?.title ?? 'View conversation'}
                </p>
              </div>
            </Link>
          )
        })}

        {/* Empty states */}
        {!isSearching && filteredThreads.length === 0 && (
          <div className="text-center py-24 px-8">
            <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 mb-1">Your messages</p>
            <p className="text-sm text-gray-500">Search for someone above to start a conversation, or message a lister from their listing.</p>
          </div>
        )}

        {isSearching && filteredThreads.length === 0 && newPeople.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No results for &ldquo;{search}&rdquo;</div>
        )}
      </div>
    </div>
  )
}
