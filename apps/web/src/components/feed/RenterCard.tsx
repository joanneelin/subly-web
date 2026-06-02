'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCents } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { FeedRenter } from '@subletu/types'

interface RenterCardProps {
  renter: FeedRenter
}

export function RenterCard({ renter }: RenterCardProps) {
  const profile = renter.profiles
  const matchPct = Math.round((renter.match_score ?? 0) * 100)

  return (
    <Link href={`/list/profile/${renter.user_id}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
        {/* Avatar */}
        <div className="relative aspect-square bg-gradient-to-br from-brand-100 to-brand-200">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-brand-400">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
          {matchPct > 0 && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-brand-700">
              {matchPct}% match
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="font-semibold text-gray-900 truncate">{profile?.full_name ?? 'Student'}</p>
          <p className="text-xs text-gray-500">{profile?.school_year} · {profile?.major}</p>
          <div className="mt-2">
            <span className="text-sm font-medium text-gray-700">
              {formatCents(renter.rent_min)}–{formatCents(renter.rent_max)}/mo
            </span>
          </div>
          {renter.move_in_earliest && (
            <p className="text-xs text-gray-400 mt-1">
              Move-in from {new Date(renter.move_in_earliest).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
          {renter.bio && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{renter.bio}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
