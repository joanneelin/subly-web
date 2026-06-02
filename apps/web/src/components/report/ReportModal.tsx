'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { REPORT_CATEGORIES } from '@subletu/config'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface ReportModalProps {
  open: boolean
  onClose: () => void
  listingId: string
  reporterId: string
}

export function ReportModal({ open, onClose, listingId, reporterId }: ReportModalProps) {
  const supabase = createClient()
  const [category, setCategory] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return
    setLoading(true)

    await supabase.from('reports').insert({
      listing_id: listingId,
      reporter_id: reporterId,
      category,
      details: details || null,
      status: 'pending',
    })

    setLoading(false)
    setSubmitted(true)
  }

  const handleClose = () => {
    setCategory('')
    setDetails('')
    setSubmitted(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Report listing">
      {submitted ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900">Thanks, we'll review this listing.</p>
          <p className="text-sm text-gray-500 mt-1">Reports are typically reviewed within 24 hours.</p>
          <Button className="mt-4" variant="secondary" onClick={handleClose}>Close</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">Select the issue you're reporting:</p>

          <div className="space-y-2">
            {REPORT_CATEGORIES.map((cat) => (
              <label key={cat.value} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-brand-400 transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={category === cat.value}
                  onChange={() => setCategory(cat.value)}
                  className="text-brand-600"
                />
                <span className="text-sm text-gray-700">{cat.label}</span>
              </label>
            ))}
          </div>

          <Textarea
            label="Additional details (optional)"
            placeholder="Describe what seems wrong..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
          />

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={loading} disabled={!category} className="flex-1">
              Submit report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
