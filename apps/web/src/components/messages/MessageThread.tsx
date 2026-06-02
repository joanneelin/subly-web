'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Message } from '@subletu/types'

interface MessageThreadProps {
  thread: any
  initialMessages: Message[]
  currentUserId: string
  otherUser: any
  basePath: string
}

export function MessageThread({ thread, initialMessages, currentUserId, otherUser, basePath }: MessageThreadProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`thread:${thread.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${thread.id}`,
      }, (payload) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === payload.new.id)) return prev
          return [...prev, payload.new as Message]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, thread.id])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)

    const { data, error } = await supabase
      .from('messages')
      .insert({ thread_id: thread.id, sender_id: currentUserId, body: body.trim() })
      .select()
      .single()

    if (!error && data) {
      setMessages((prev) => [...prev, data])
      setBody('')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
        <Link href={basePath} className="text-gray-400 hover:text-gray-600 mr-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center text-white font-bold">
          {otherUser?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{otherUser?.full_name}</p>
          {thread.listing && (
            <p className="text-xs text-gray-400">Re: {thread.listing.title || 'Listing'}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No messages yet. Say hi!
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                {msg.body}
                <div className={`text-xs mt-1 ${isOwn ? 'text-brand-200' : 'text-gray-400'}`}>
                  {timeAgo(msg.created_at)}
                  {isOwn && msg.seen_at && ' · Seen'}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 bg-white border-t">
        <input
          type="text"
          placeholder="Type a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Button type="submit" loading={sending} size="sm" disabled={!body.trim()}>
          Send
        </Button>
      </form>
    </div>
  )
}
