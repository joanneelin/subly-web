'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UNIT_TYPES, GENDER_PREFERENCES } from '@subletu/config'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Listing } from '@subletu/types'

interface ListingFormProps {
  userId: string
  listing?: Listing
  onSuccess: (listing: Listing) => void
}

export function ListingForm({ userId, listing, onSuccess }: ListingFormProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: listing?.title ?? '',
    description: listing?.description ?? '',
    rent: listing ? String(listing.rent / 100) : '',
    deposit: listing?.deposit ? String(listing.deposit / 100) : '',
    utilities_included: listing?.utilities_included ?? false,
    unit_type: listing?.unit_type ?? 'studio',
    furnished: listing?.furnished ?? false,
    bedrooms: listing ? String(listing.bedrooms) : '',
    bathrooms: listing ? String(listing.bathrooms) : '',
    start_date: listing?.start_date ?? '',
    end_date: listing?.end_date ?? '',
    address: listing?.address ?? '',
    gender_preference: listing?.gender_preference ?? 'any',
    existing_roommates: listing?.existing_roommates ?? 0,
    bio: '',
    pets: (listing?.house_rules as any)?.pets ?? false,
    smoking: (listing?.house_rules as any)?.smoking ?? false,
    guests: (listing?.house_rules as any)?.guests ?? true,
    quiet_hours: (listing?.house_rules as any)?.quiet_hours ?? '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      user_id: userId,
      title: form.title,
      description: form.description,
      rent: Math.round(Number(form.rent) * 100),
      deposit: form.deposit ? Math.round(Number(form.deposit) * 100) : null,
      utilities_included: form.utilities_included,
      unit_type: form.unit_type,
      furnished: form.furnished,
      bedrooms: Number(form.bedrooms) || 1,
      bathrooms: Number(form.bathrooms) || 1,
      start_date: form.start_date,
      end_date: form.end_date,
      address: form.address,
      gender_preference: form.gender_preference,
      existing_roommates: form.existing_roommates,
      house_rules: {
        pets: form.pets,
        smoking: form.smoking,
        guests: form.guests,
        quiet_hours: form.quiet_hours || null,
      },
      active: true,
    }

    let data, err
    if (listing) {
      const res = await supabase.from('listings').update(payload).eq('id', listing.id).select().single()
      data = res.data; err = res.error
    } else {
      const res = await supabase.from('listings').insert(payload).select().single()
      data = res.data; err = res.error
    }

    setSaving(false)
    if (err) { setError(err.message); return }
    onSuccess(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
      <h3 className="font-semibold text-gray-900">{listing ? 'Edit listing' : 'New listing'}</h3>

      <Input label="Title" placeholder="Cozy 1BR near campus" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
      <Textarea label="Description" placeholder="Tell renters about your place..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Monthly rent ($)" type="number" min={0} placeholder="e.g. 1300" value={form.rent} onChange={(e) => setForm((p) => ({ ...p, rent: e.target.value }))} required />
        <Input label="Deposit ($)" type="number" min={0} placeholder="e.g. 500" value={form.deposit} onChange={(e) => setForm((p) => ({ ...p, deposit: e.target.value }))} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Unit type" options={UNIT_TYPES.map((u) => ({ value: u.value, label: u.label }))} value={form.unit_type} onChange={(e) => setForm((p) => ({ ...p, unit_type: e.target.value as any }))} />
        <Select label="Gender preference" options={GENDER_PREFERENCES.map((g) => ({ value: g.value, label: g.label }))} value={form.gender_preference} onChange={(e) => setForm((p) => ({ ...p, gender_preference: e.target.value as any }))} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Bedrooms" type="number" min={0} placeholder="1" value={form.bedrooms} onChange={(e) => setForm((p) => ({ ...p, bedrooms: e.target.value }))} />
        <Input label="Bathrooms" type="number" min={0} step={0.5} placeholder="1" value={form.bathrooms} onChange={(e) => setForm((p) => ({ ...p, bathrooms: e.target.value }))} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Available from" type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} required />
        <Input label="Available until" type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} required />
      </div>

      <Input label="Address" placeholder="123 Main St, Philadelphia, PA" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} required />

      <div className="flex flex-wrap gap-4 text-sm">
        {[
          { key: 'furnished', label: 'Furnished' },
          { key: 'utilities_included', label: 'Utilities included' },
          { key: 'pets', label: 'Pets OK' },
          { key: 'smoking', label: 'Smoking OK' },
          { key: 'guests', label: 'Guests OK' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
              className="rounded text-brand-600"
            />
            {label}
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={saving}>
        {listing ? 'Update listing' : 'Create listing'}
      </Button>
    </form>
  )
}
