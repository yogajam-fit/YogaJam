"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader } from '@/components/ui/Loader'

export type HostRequest = {
  id: string
  type: 'build_your_own' | 'start_planning'
  status: 'pending' | 'responded' | 'rejected'
  name: string
  email: string
  phone: string
  group_size: string
  city: string
  date_or_timeline: string
  event_title: string | null
  event_type: string | null
  location_type: string | null
  vision: string | null
  created_at: string
}

export function HostRequestsTable() {
  const [requests, setRequests] = useState<HostRequest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('personalized_events')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setRequests(data)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: 'responded' | 'rejected') => {
    // Optimistic UI update
    setRequests((prev) => prev.map(r => r.id === id ? { ...r, status } : r))
    
    // Database update
    await supabase.from('personalized_events').update({ status }).eq('id', id)

    // Send confirmation email
    if (status === 'responded') {
      const request = requests.find(req => req.id === id)
      if (request) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: request.email,
              subject: 'We received your YogaJam Host Request!',
              type: 'host_confirmation',
              name: request.name
            })
          })
        } catch (e) {
          console.error('Failed to send confirmation email', e)
        }
      }
    }
  }

  if (loading) {
    return <Loader />
  }

  if (requests.length === 0) {
    return (
      <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-12 text-center">
        <p className="text-text-secondary">No host requests have been submitted yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black/20 text-text-secondary uppercase tracking-wider text-[11px] font-bold">
            <tr>
              <th className="px-6 py-4">Submitted</th>
              <th className="px-6 py-4">Guest</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Vision / Extra Info</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-surface transition-colors group">
                <td className="px-6 py-4 align-top text-text-secondary">
                  <div className="flex flex-col">
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-500">{new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <p className="font-medium text-foreground">{request.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{request.email}</p>
                  <p className="text-xs text-gray-500">{request.phone}</p>
                </td>
                <td className="px-6 py-4 align-top">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    request.type === 'start_planning' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {request.type === 'start_planning' ? 'Event Booking' : 'Build Your Own'}
                  </span>
                  {request.event_title && (
                    <p className="text-xs text-text-secondary mt-2 truncate max-w-[150px]" title={request.event_title}>
                      For: {request.event_title}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 align-top text-gray-300">
                  <p><span className="text-gray-500">City:</span> {request.city}</p>
                  <p className="mt-1"><span className="text-gray-500">Date/Time:</span> {request.date_or_timeline}</p>
                  <p className="mt-1"><span className="text-gray-500">Group Size:</span> {request.group_size}</p>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="max-h-24 overflow-y-auto custom-scrollbar pr-2 max-w-sm whitespace-normal text-gray-300">
                    {request.type === 'build_your_own' ? (
                      <>
                        {request.event_type && <p className="mb-1"><span className="text-gray-500 font-semibold">Event Type:</span> {request.event_type}</p>}
                        {request.location_type && <p className="mb-1"><span className="text-gray-500 font-semibold">Location:</span> {request.location_type}</p>}
                        {request.vision && <p><span className="text-gray-500 font-semibold">Vision:</span> {request.vision}</p>}
                      </>
                    ) : (
                      <p className="text-gray-500 italic">No extra info provided.</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-top text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    request.status === 'responded' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {request.status === 'pending' ? 'Not Responded' : request.status === 'responded' ? 'Responded' : 'Rejected'}
                  </span>
                </td>
                <td className="px-6 py-4 align-top text-right">
                  <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    {request.status !== 'responded' && (
                      <button 
                        onClick={() => updateStatus(request.id, 'responded')}
                        className="text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 p-2 rounded-lg transition-colors flex items-center gap-1"
                        title="Mark as Responded"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                    {request.status !== 'rejected' && (
                      <button 
                        onClick={() => updateStatus(request.id, 'rejected')}
                        className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
