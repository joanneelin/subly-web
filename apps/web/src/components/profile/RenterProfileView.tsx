'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCents } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AMENITIES, GENDER_ENVIRONMENTS } from '@subletu/config'
import type { Profile, RenterPreferences } from '@subletu/types'

interface RenterProfileViewProps {
  profile: Profile
  renterPrefs?: RenterPreferences | null
  currentUserId?: string
  isOwnProfile: boolean
}

export function RenterProfileView({ profile, renterPrefs, currentUserId, isOwnProfile }: RenterProfileViewProps) {
  const router = useRouter()
  const supabase = createClient()
  const [messagingState, setMessagingState] = useState(false)

  const handleMessage = async () => {
    if (!currentUserId) { router.push('/sign-in'); return }
    setMessagingState(true)

    const { data: existing } = await supabase
      .from('threads')
      .select('id')
      .eq('lister_id', currentUserId)
      .eq('renter_id', profile.id)
      .maybeSingle()

    if (existing) { router.push(`/list/messages/${existing.id}`); return }

    const { data: thread } = await supabase
      .from('threads')
      .insert({ lister_id: currentUserId, renter_id: profile.id })
      .select('id')
      .single()

    setMessagingState(false)
    if (thread) router.push(`/list/messages/${thread.id}`)
  }

  const genderEnvLabel = GENDER_ENVIRONMENTS.find((g) => g.value === renterPrefs?.gender_env)?.label

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Avatar + basic info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
          </div>
          <p className="text-gray-500 mt-0.5">{profile.school_year} · {profile.major}</p>
        </div>
      </div>

      {renterPrefs && (
        <>
          {/* Budget */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Budget</h3>
            <p className="text-lg font-bold text-gray-900">
              {formatCents(renterPrefs.rent_min)} – {formatCents(renterPrefs.rent_max)}<span className="text-sm font-normal text-gray-500">/mo</span>
            </p>
          </div>

          {/* Dates */}
          {renterPrefs.move_in_earliest && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Availability</h3>
              <p className="text-sm text-gray-600">
                {new Date(renterPrefs.move_in_earliest).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                {renterPrefs.move_out_latest && ` – ${new Date(renterPrefs.move_out_latest).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
              </p>
            </div>
          )}

          {/* Unit type preference */}
          {renterPrefs.unit_type_pref?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Looking for</h3>
              <div className="flex flex-wrap gap-2">
                {renterPrefs.unit_type_pref.map((t) => (
                  <Badge key={t} variant="brand">{t.toUpperCase()}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Gender environment */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Gender environment</h3>
            <Badge>{genderEnvLabel ?? renterPrefs.gender_env}</Badge>
          </div>

          {/* Amenities */}
          {renterPrefs.amenities?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Must-haves</h3>
              <div className="flex flex-wrap gap-2">
                {renterPrefs.amenities.map((a) => {
                  const label = AMENITIES.find((x) => x.value === a)?.label ?? a
                  return <Badge key={a} variant="success">{label}</Badge>
                })}
              </div>
            </div>
          )}

          {/* Bio */}
          {renterPrefs.bio && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">About me</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{renterPrefs.bio}</p>
            </div>
          )}
        </>
      )}

      {!isOwnProfile && (
        <Button onClick={handleMessage} loading={messagingState} size="lg" className="w-full">
          Message {profile.full_name?.split(' ')[0]}
        </Button>
      )}
    </div>
  )
}
