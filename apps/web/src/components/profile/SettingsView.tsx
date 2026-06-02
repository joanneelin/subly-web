'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SCHOOL_YEARS, UNIT_TYPES, AMENITIES, GENDER_ENVIRONMENTS } from '@subletu/config'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { ListingForm } from './ListingForm'
import { formatCents } from '@/lib/utils'
import type { Profile, RenterPreferences, Listing, Amenity, UnitType } from '@subletu/types'

interface SettingsViewProps {
  profile: Profile | null
  renterPrefs: RenterPreferences | null
  listings: Listing[]
  defaultTab?: Tab
  tabs?: Tab[]
}

type Tab = 'profile' | 'preferences' | 'listings'

export function SettingsView({ profile, renterPrefs, listings: initialListings, defaultTab = 'profile', tabs: allowedTabs }: SettingsViewProps) {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [listings, setListings] = useState(initialListings)
  const [showListingForm, setShowListingForm] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name ?? '',
    school_year: profile?.school_year ?? '',
    major: profile?.major ?? '',
  })

  const [prefsForm, setPrefsForm] = useState({
    rent_min: renterPrefs?.rent_min ?? 50000,
    rent_max: renterPrefs?.rent_max ?? 200000,
    unit_type_pref: renterPrefs?.unit_type_pref ?? [] as UnitType[],
    gender_env: renterPrefs?.gender_env ?? 'no_preference',
    roommates_max: renterPrefs?.roommates_max ?? 3,
    amenities: renterPrefs?.amenities ?? [] as Amenity[],
    campus_radius_km: renterPrefs?.campus_radius_km ?? 5,
    bio: renterPrefs?.bio ?? '',
    move_in_earliest: renterPrefs?.move_in_earliest ?? '',
    move_out_latest: renterPrefs?.move_out_latest ?? '',
  })

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    setSuccess(false)
    setSaveError(null)
    const { error } = await supabase.from('profiles').update(profileForm).eq('id', profile.id)
    setSaving(false)
    if (error) setSaveError(error.message)
    else setSuccess(true)
  }

  const savePreferences = async () => {
    if (!profile) return
    setSaving(true)
    setSuccess(false)
    setSaveError(null)
    const { error } = await supabase.from('renter_preferences').upsert({ user_id: profile.id, ...prefsForm })
    setSaving(false)
    if (error) setSaveError(error.message)
    else setSuccess(true)
  }

  const toggleListingActive = async (listingId: string, active: boolean) => {
    await supabase.from('listings').update({ active }).eq('id', listingId)
    setListings((prev) => prev.map((l) => l.id === listingId ? { ...l, active } : l))
  }

  const ALL_TABS: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'listings', label: 'Listings' },
  ]
  const TABS = allowedTabs ? ALL_TABS.filter((t) => allowedTabs.includes(t.id)) : ALL_TABS

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSuccess(false) }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
              tab === t.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <Input
            label="Full name"
            value={profileForm.full_name}
            onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
          />
          <Select
            label="School year"
            options={SCHOOL_YEARS.map((y) => ({ value: y, label: y }))}
            value={profileForm.school_year}
            onChange={(e) => setProfileForm((p) => ({ ...p, school_year: e.target.value }))}
          />
          <Input
            label="Major"
            value={profileForm.major}
            onChange={(e) => setProfileForm((p) => ({ ...p, major: e.target.value }))}
          />
          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-2">
              Email: <strong>{profile?.school_email}</strong>
              {profile?.verified && <Badge variant="success" className="ml-2">Verified</Badge>}
            </p>
          </div>
          {success && <p className="text-sm text-green-600">Saved!</p>}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <Button onClick={saveProfile} loading={saving}>Save profile</Button>
        </div>
      )}

      {/* Preferences tab */}
      {tab === 'preferences' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min rent ($/mo)"
              type="number"
              value={prefsForm.rent_min / 100}
              onChange={(e) => setPrefsForm((p) => ({ ...p, rent_min: Number(e.target.value) * 100 }))}
            />
            <Input
              label="Max rent ($/mo)"
              type="number"
              value={prefsForm.rent_max / 100}
              onChange={(e) => setPrefsForm((p) => ({ ...p, rent_max: Number(e.target.value) * 100 }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Move-in from"
              type="date"
              value={prefsForm.move_in_earliest}
              onChange={(e) => setPrefsForm((p) => ({ ...p, move_in_earliest: e.target.value }))}
            />
            <Input
              label="Move-out by"
              type="date"
              value={prefsForm.move_out_latest}
              onChange={(e) => setPrefsForm((p) => ({ ...p, move_out_latest: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit type preference</label>
            <div className="flex flex-wrap gap-2">
              {UNIT_TYPES.map((ut) => (
                <button
                  key={ut.value}
                  type="button"
                  onClick={() =>
                    setPrefsForm((p) => ({
                      ...p,
                      unit_type_pref: p.unit_type_pref.includes(ut.value as UnitType)
                        ? p.unit_type_pref.filter((t) => t !== ut.value)
                        : [...p.unit_type_pref, ut.value as UnitType],
                    }))
                  }
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    prefsForm.unit_type_pref.includes(ut.value as UnitType)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {ut.label}
                </button>
              ))}
            </div>
          </div>
          <Select
            label="Gender environment"
            options={GENDER_ENVIRONMENTS.map((g) => ({ value: g.value, label: g.label }))}
            value={prefsForm.gender_env}
            onChange={(e) => setPrefsForm((p) => ({ ...p, gender_env: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Must-have amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() =>
                    setPrefsForm((p) => ({
                      ...p,
                      amenities: p.amenities.includes(a.value as Amenity)
                        ? p.amenities.filter((x) => x !== a.value)
                        : [...p.amenities, a.value as Amenity],
                    }))
                  }
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    prefsForm.amenities.includes(a.value as Amenity)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Short bio"
            value={prefsForm.bio}
            onChange={(e) => setPrefsForm((p) => ({ ...p, bio: e.target.value }))}
            rows={3}
          />
          {success && <p className="text-sm text-green-600">Saved!</p>}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <Button onClick={savePreferences} loading={saving}>Save preferences</Button>
        </div>
      )}

      {/* Listings tab */}
      {tab === 'listings' && (
        <div className="space-y-4">
          {!showListingForm && !editingListing && (
            <Button onClick={() => setShowListingForm(true)} variant="secondary">
              + Create new listing
            </Button>
          )}

          {showListingForm && (
            <>
              <ListingForm
                userId={profile!.id}
                onSuccess={(listing) => {
                  setListings((prev) => [listing, ...prev])
                  setShowListingForm(false)
                }}
              />
              <Button onClick={() => setShowListingForm(false)} variant="ghost" size="sm">
                Cancel
              </Button>
            </>
          )}

          {editingListing && (
            <>
              <ListingForm
                key={editingListing.id}
                userId={profile!.id}
                listing={editingListing}
                onSuccess={(updated) => {
                  setListings((prev) => prev.map((l) => l.id === updated.id ? updated : l))
                  setEditingListing(null)
                }}
              />
              <Button onClick={() => setEditingListing(null)} variant="ghost" size="sm">
                Cancel
              </Button>
            </>
          )}

          {listings.length === 0 && !showListingForm && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No listings yet. Create your first one!
            </div>
          )}

          {listings.map((listing) => (
            <div key={listing.id} className="border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{listing.title || `${listing.unit_type.toUpperCase()} Sublet`}</p>
                  <p className="text-sm text-gray-500">{formatCents(listing.rent)}/mo · {listing.address}</p>
                </div>
                <Badge variant={listing.active ? 'success' : 'default'}>
                  {listing.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toggleListingActive(listing.id, !listing.active)}
                >
                  {listing.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { setEditingListing(listing); setShowListingForm(false) }}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
