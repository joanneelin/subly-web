'use client'

import { UNIT_TYPES, GENDER_PREFERENCES } from '@subletu/config'

export interface FeedFilterState {
  maxPrice: string
  unitType: string
  genderPolicy: string
  maxBudget: string
}

interface FeedFiltersProps {
  mode: 'renter' | 'lister'
  filters: FeedFilterState
  onChange: (filters: FeedFilterState) => void
}

export function FeedFilters({ mode, filters, onChange }: FeedFiltersProps) {
  const set = (key: keyof FeedFilterState) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value })

  return (
    <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {mode === 'renter' && (
        <>
          <select
            value={filters.maxPrice}
            onChange={set('maxPrice')}
            className="shrink-0 text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Any price</option>
            <option value="100000">Under $1,000</option>
            <option value="150000">Under $1,500</option>
            <option value="200000">Under $2,000</option>
            <option value="300000">Under $3,000</option>
          </select>
          <select
            value={filters.unitType}
            onChange={set('unitType')}
            className="shrink-0 text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Any unit</option>
            {UNIT_TYPES.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
          <select
            value={filters.genderPolicy}
            onChange={set('genderPolicy')}
            className="shrink-0 text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Any gender policy</option>
            {GENDER_PREFERENCES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </>
      )}
      {mode === 'lister' && (
        <select
          value={filters.maxBudget}
          onChange={set('maxBudget')}
          className="shrink-0 text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Any budget</option>
          <option value="100000">Up to $1,000</option>
          <option value="150000">Up to $1,500</option>
          <option value="200000">Up to $2,000</option>
        </select>
      )}
    </div>
  )
}
