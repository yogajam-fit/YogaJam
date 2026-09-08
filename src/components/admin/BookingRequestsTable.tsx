'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/utils/supabase/client'
import { Loader } from '@/components/ui/Loader'

type BookingRequest = {
  id: string
  event_id: string
  name: string
  email: string
  phone: string
  tickets: number
  total_amount: string
  verify_method: string
  utr_number: string
  screenshot_url: string
  status: 'pending' | 'confirmed' | 'rejected'
  created_at: string
  events: {
    title: string
  }
}

export function BookingRequestsTable() {
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('booking_requests')
      .select(`
        *,
        events ( title )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching booking requests:', error)
    } else {
      setRequests(data as any)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, newStatus: 'confirmed' | 'rejected') => {
    const { error } = await supabase
      .from('booking_requests')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Failed to update status')
      return
    }

    setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req))

    // Send confirmation email
    if (newStatus === 'confirmed') {
      const request = requests.find(req => req.id === id)
      if (request) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: request.email,
              subject: 'Your YogaJam Booking is Confirmed!',
              type: 'booking_confirmation',
              name: request.name,
              eventTitle: request.events?.title,
              amount: request.total_amount,
              tickets: request.tickets
            })
          })
        } catch (e) {
          console.error('Failed to send confirmation email', e)
        }
      }
    } else if (newStatus === 'rejected') {
      const request = requests.find(req => req.id === id)
      if (request) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: request.email,
              subject: 'Action Required: Payment Verification Failed',
              type: 'booking_rejected',
              name: request.name,
              eventTitle: request.events?.title,
              amount: request.total_amount,
              tickets: request.tickets
            })
          })
        } catch (e) {
          console.error('Failed to send rejection email', e)
        }
      }
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-foreground/ border-b border-border text-foreground-secondary">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Event</th>
              <th className="px-6 py-4 font-semibold">Guest Details</th>
              <th className="px-6 py-4 font-semibold">Tickets & Total</th>
              <th className="px-6 py-4 font-semibold">Payment Info</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No booking requests found.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(req.created_at).toLocaleDateString()}
                    <div className="text-xs text-gray-500">{new Date(req.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-foreground">{req.events?.title || 'Unknown Event'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{req.name}</div>
                    <div className="text-xs text-foreground-secondary">{req.email}</div>
                    <div className="text-xs text-foreground-secondary">{req.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-foreground">{req.tickets} ticket(s)</div>
                    <div className="text-xs font-bold text-accent">{req.total_amount || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="capitalize font-medium text-foreground text-xs px-2 py-1 bg-foreground/ rounded inline-block">
                      {req.verify_method}
                    </div>
                    {req.utr_number && (
                      <div className="text-xs text-foreground-secondary mt-1 font-mono">UTR: {req.utr_number}</div>
                    )}
                    {req.screenshot_url && (
                      <button 
                        onClick={() => setViewScreenshotUrl(req.screenshot_url)}
                        className="text-xs text-accent hover:text-accent-hover mt-1 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        View Screenshot
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      req.status === 'confirmed' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : req.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      {req.status !== 'confirmed' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'confirmed')}
                          className="px-3 py-1.5 text-xs font-bold bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {req.status !== 'rejected' && (
                        <button 
                          onClick={() => updateStatus(req.id, 'rejected')}
                          className="px-3 py-1.5 text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      {viewScreenshotUrl && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setViewScreenshotUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 text-foreground hover:text-gray-300 p-2"
              onClick={() => setViewScreenshotUrl(null)}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img 
              src={viewScreenshotUrl} 
              alt="Payment Screenshot" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
