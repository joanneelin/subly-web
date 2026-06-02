'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCents, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ReportModal } from '@/components/report/ReportModal'
import type { Profile, Listing } from '@subletu/types'

interface ListingProfileViewProps {
  profile: Profile
  listing: Listing
  currentUserId?: string
  isOwnProfile: boolean
  isSaved: boolean
}

const GENDER_LABELS: Record<string, string> = {
  any: 'Any gender',
  female: 'Women only',
  male: 'Men only',
  nonbinary: 'Non-binary preferred',
}

export function ListingProfileView({ profile, listing, currentUserId, isOwnProfile, isSaved }: ListingProfileViewProps) {
  const router = useRouter()
  const supabase = createClient()
  const [photoIdx, setPhotoIdx] = useState(0)
  const [saved, setSaved] = useState(isSaved)
  const [savingState, setSavingState] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [messagingState, setMessagingState] = useState(false)

  const photos = listing.image_urls ?? []

  const handleSave = async () => {
    if (!currentUserId) { router.push('/sign-in'); return }
    setSavingState(true)
    if (saved) {
      await supabase.from('saves').delete()
        .eq('user_id', currentUserId)
        .eq('saved_listing_id', listing.id)
      setSaved(false)
    } else {
      await supabase.from('saves').upsert({ user_id: currentUserId, saved_listing_id: listing.id })
      setSaved(true)
    }
    setSavingState(false)
  }

  const handleMessage = async () => {
    if (!currentUserId) { router.push('/sign-in'); return }
    setMessagingState(true)

    const { data: existing } = await supabase
      .from('threads')
      .select('id')
      .eq('lister_id', profile.id)
      .eq('renter_id', currentUserId)
      .maybeSingle()

    if (existing) {
      router.push(`/rent/messages/${existing.id}`)
      return
    }

    const { data: thread } = await supabase
      .from('threads')
      .insert({ lister_id: profile.id, renter_id: currentUserId, listing_id: listing.id })
      .select('id')
      .single()

    setMessagingState(false)
    if (thread) router.push(`/rent/messages/${thread.id}`)
  }

  const rules = listing.house_rules as { pets?: boolean; smoking?: boolean; guests?: boolean; quiet_hours?: string | null }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Photo carousel */}
      {photos.length > 0 ? (
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-gray-100">
          <Image src={photos[photoIdx]} alt="Listing photo" fill className="object-cover" />
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIdx ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-100 aspect-[4/3] mb-4 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
      )}

      {/* Title & price */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{listing.title || `${listing.unit_type.toUpperCase()} Sublet`}</h1>
          <p className="text-gray-500 text-sm mt-1">{listing.address}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold text-gray-900">{formatCents(listing.rent)}</span>
          <span className="text-gray-500 text-sm">/mo</span>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="brand">{listing.unit_type.toUpperCase()}</Badge>
        {listing.furnished && <Badge variant="success">Furnished</Badge>}
        {listing.utilities_included && <Badge variant="success">Utilities included</Badge>}
        {listing.deposit && <Badge>Deposit: {formatCents(listing.deposit)}</Badge>}
        <Badge>{GENDER_LABELS[listing.gender_preference] ?? listing.gender_preference}</Badge>
      </div>

      {/* Dates */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Lease period</h3>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{formatDate(listing.start_date)}</span>
          <span>→</span>
          <span>{formatDate(listing.end_date)}</span>
        </div>
      </div>

      {/* Roommates */}
      {listing.existing_roommates > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Roommates</h3>
          <p className="text-sm text-gray-600">
            {listing.existing_roommates} existing roommate{listing.existing_roommates !== 1 ? 's' : ''}
            {listing.roommate_genders?.length > 0 && ` (${listing.roommate_genders.join(', ')})`}
          </p>
        </div>
      )}

      {/* House rules */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">House rules</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className={`flex items-center gap-1.5 ${rules?.pets ? 'text-green-600' : 'text-red-500'}`}>
            <span>{rules?.pets ? '✓' : '✗'}</span> Pets
          </div>
          <div className={`flex items-center gap-1.5 ${rules?.smoking ? 'text-green-600' : 'text-red-500'}`}>
            <span>{rules?.smoking ? '✓' : '✗'}</span> Smoking
          </div>
          <div className={`flex items-center gap-1.5 ${rules?.guests ? 'text-green-600' : 'text-red-500'}`}>
            <span>{rules?.guests ? '✓' : '✗'}</span> Guests
          </div>
        </div>
        {rules?.quiet_hours && (
          <p className="text-xs text-gray-500 mt-2">Quiet hours: {rules.quiet_hours}</p>
        )}
      </div>

      {/* Description */}
      {listing.description && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About this listing</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
        </div>
      )}

      {/* Lister info */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg">
          {profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profile.full_name}</p>
          <p className="text-xs text-gray-500">{profile.school_year} · {profile.major}</p>
        </div>
      </div>

      {/* Actions */}
      {!isOwnProfile && (
        <div className="flex gap-3">
          <Button onClick={handleMessage} loading={messagingState} size="lg" className="flex-1">
            Message
          </Button>
          <Button onClick={handleSave} loading={savingState} variant="secondary" size="lg">
            {saved ? (
              <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </Button>
          <Button onClick={() => setReportOpen(true)} variant="ghost" size="lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
        </div>
      )}

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        listingId={listing.id}
        reporterId={currentUserId ?? ''}
      />
    </div>
  )
}
