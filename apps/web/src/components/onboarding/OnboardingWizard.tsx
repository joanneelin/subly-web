'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SCHOOL_YEARS, UNIT_TYPES, GENDER_ENVIRONMENTS, AMENITIES } from '@subletu/config'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { UnitType, Amenity } from '@subletu/types'

const RENTER_STEPS = ['Basic Info', 'Preferences', 'Review']
const LISTER_STEPS = ['Basic Info', 'Done']

export function OnboardingWizard() {
  const router = useRouter()
  const supabase = createClient()
  const [intent, setIntent] = useState<'rent' | 'list' | null>(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const STEPS = intent === 'list' ? LISTER_STEPS : RENTER_STEPS

  const [basicInfo, setBasicInfo] = useState({
    full_name: '',
    school_year: '',
    major: '',
  })

  const [renterPrefs, setRenterPrefs] = useState({
    rent_min: 50000,
    rent_max: 200000,
    unit_type_pref: [] as UnitType[],
    gender_env: 'no_preference',
    roommates_max: 3,
    amenities: [] as Amenity[],
    campus_radius_km: 5,
    bio: '',
    move_in_earliest: '',
    move_out_latest: '',
  })

  const toggleUnitType = (type: UnitType) => {
    setRenterPrefs((p) => ({
      ...p,
      unit_type_pref: p.unit_type_pref.includes(type)
        ? p.unit_type_pref.filter((t) => t !== type)
        : [...p.unit_type_pref, type],
    }))
  }

  const toggleAmenity = (a: Amenity) => {
    setRenterPrefs((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: basicInfo.full_name,
        school_year: basicInfo.school_year,
        major: basicInfo.major,
      })
      .eq('id', user.id)

    if (profileError) { setError(profileError.message); setLoading(false); return }

    if (intent === 'list') {
      router.push('/list/dashboard')
      return
    }

    const { error: prefError } = await supabase
      .from('renter_preferences')
      .upsert({
        user_id: user.id,
        rent_min: renterPrefs.rent_min,
        rent_max: renterPrefs.rent_max,
        unit_type_pref: renterPrefs.unit_type_pref,
        gender_env: renterPrefs.gender_env,
        roommates_max: renterPrefs.roommates_max,
        amenities: renterPrefs.amenities,
        campus_radius_km: renterPrefs.campus_radius_km,
        bio: renterPrefs.bio,
        move_in_earliest: renterPrefs.move_in_earliest || null,
        move_out_latest: renterPrefs.move_out_latest || null,
      })

    if (prefError) { setError(prefError.message); setLoading(false); return }

    router.push('/rent/feed')
  }

  const canNext = () => {
    if (step === 0) return basicInfo.full_name.trim() && basicInfo.school_year
    return true
  }

  if (!intent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border w-full max-w-lg p-8 text-center">
        <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Subly</h2>
        <p className="text-gray-500 text-sm mb-8">What are you here to do?</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIntent('rent')}
            className="group border-2 border-gray-200 rounded-2xl p-6 hover:border-brand-400 hover:bg-brand-50 transition-all text-left"
          >
            <svg className="w-8 h-8 text-brand-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="font-semibold text-gray-900">Find a sublet</p>
            <p className="text-xs text-gray-500 mt-1">Browse available listings near campus</p>
          </button>
          <button
            onClick={() => setIntent('list')}
            className="group border-2 border-gray-200 rounded-2xl p-6 hover:border-green-400 hover:bg-green-50 transition-all text-left"
          >
            <svg className="w-8 h-8 text-green-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p className="font-semibold text-gray-900">List my place</p>
            <p className="text-xs text-gray-500 mt-1">Post your sublet and find renters</p>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border w-full max-w-lg">
      {/* Progress bar */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Step {step + 1} of {STEPS.length}</span>
          <span className="text-sm font-semibold text-brand-600">{STEPS[step]}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Step 0: Basic info */}
        {step === 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-900">Tell us about yourself</h2>
            <Input
              label="Full name"
              placeholder="Jane Smith"
              value={basicInfo.full_name}
              onChange={(e) => setBasicInfo((p) => ({ ...p, full_name: e.target.value }))}
              required
            />
            <Select
              label="School year"
              options={SCHOOL_YEARS.map((y) => ({ value: y, label: y }))}
              placeholder="Select your year"
              value={basicInfo.school_year}
              onChange={(e) => setBasicInfo((p) => ({ ...p, school_year: e.target.value }))}
            />
            <Input
              label="Major"
              placeholder="e.g. Computer Science"
              value={basicInfo.major}
              onChange={(e) => setBasicInfo((p) => ({ ...p, major: e.target.value }))}
            />
          </>
        )}

        {/* Step 1: All set (listers only) */}
        {step === 1 && intent === 'list' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h2>
            <p className="text-gray-500 text-sm">Next, create your first listing from the host dashboard.</p>
          </div>
        )}

        {/* Step 1: Preferences (renters only) */}
        {step === 1 && intent === 'rent' && (
          <>
            <h2 className="text-xl font-bold text-gray-900">Your housing preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min rent ($/mo)"
                type="number"
                value={renterPrefs.rent_min / 100}
                onChange={(e) => setRenterPrefs((p) => ({ ...p, rent_min: Number(e.target.value) * 100 }))}
              />
              <Input
                label="Max rent ($/mo)"
                type="number"
                value={renterPrefs.rent_max / 100}
                onChange={(e) => setRenterPrefs((p) => ({ ...p, rent_max: Number(e.target.value) * 100 }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Move-in from"
                type="date"
                value={renterPrefs.move_in_earliest}
                onChange={(e) => setRenterPrefs((p) => ({ ...p, move_in_earliest: e.target.value }))}
              />
              <Input
                label="Move-out by"
                type="date"
                value={renterPrefs.move_out_latest}
                onChange={(e) => setRenterPrefs((p) => ({ ...p, move_out_latest: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit type</label>
              <div className="flex flex-wrap gap-2">
                {UNIT_TYPES.map((ut) => (
                  <button
                    key={ut.value}
                    type="button"
                    onClick={() => toggleUnitType(ut.value as UnitType)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      renterPrefs.unit_type_pref.includes(ut.value as UnitType)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {ut.label}
                  </button>
                ))}
              </div>
            </div>
            <Select
              label="Gender environment preference"
              options={GENDER_ENVIRONMENTS.map((g) => ({ value: g.value, label: g.label }))}
              value={renterPrefs.gender_env}
              onChange={(e) => setRenterPrefs((p) => ({ ...p, gender_env: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Must-have amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => toggleAmenity(a.value as Amenity)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      renterPrefs.amenities.includes(a.value as Amenity)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="Short bio"
              placeholder="Tell listers a bit about yourself — lifestyle, schedule, what you're looking for..."
              value={renterPrefs.bio}
              onChange={(e) => setRenterPrefs((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
            />
          </>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-gray-900">Look good?</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700">Name</span>
                <span>{basicInfo.full_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700">Year</span>
                <span>{basicInfo.school_year}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700">Major</span>
                <span>{basicInfo.major || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700">Budget</span>
                <span>${renterPrefs.rent_min / 100}–${renterPrefs.rent_max / 100}/mo</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">You can edit everything from your profile at any time.</p>
          </>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="p-6 border-t flex items-center justify-between">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Continue
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={loading}>
            Get started
          </Button>
        )}
      </div>
    </div>
  )
}
