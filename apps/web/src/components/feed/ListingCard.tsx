'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCents, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { FeedListing } from '@subletu/types'

interface ListingCardProps {
  listing: FeedListing
}

const UNIT_LABELS: Record<string, string> = {
  studio: 'Studio',
  '1br': '1BR',
  '2br': '2BR',
  '3br': '3BR+',
}

const GENDER_LABELS: Record<string, string> = {
  any: 'Any',
  female: 'Women only',
  male: 'Men only',
  nonbinary: 'NB preferred',
}

export function ListingCard({ listing }: ListingCardProps) {
  const primaryPhoto = listing.image_urls?.[0]
  const matchPct = Math.round((listing.match_score ?? 0) * 100)

  return (
    <Link href={`/rent/profile/${listing.user_id}?listing=${listing.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
        {/* Photo */}
        <div className="relative aspect-[4/3] bg-gray-100">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
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
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-900">{formatCents(listing.rent)}/mo</span>
            <Badge>{UNIT_LABELS[listing.unit_type] ?? listing.unit_type}</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">{listing.address}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-xs text-gray-500">
              {formatDate(listing.start_date)} – {formatDate(listing.end_date)}
            </span>
          </div>
          <div className="mt-2">
            <Badge variant="default">{GENDER_LABELS[listing.gender_preference] ?? listing.gender_preference}</Badge>
          </div>
        </div>
      </div>
    </Link>
  )
}
