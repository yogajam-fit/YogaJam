"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'
import { formatPrice } from '@/lib/utils'

export type EventRecord = {
  id: string
  title: string
  date: string
  time: string
  price?: string
  city: string
  location: string
  location_url?: string
  preview_desc: string
  preview_highlight?: string
  full_desc: string
  image: string
  video?: string
  qr_code?: string
  includes: string[]
  run_of_show: { time: string, title: string, desc: string }[]
  booking_type: 'platform' | 'qr' | 'contact'
  booking_links: Record<string, string> | null
  created_at?: string
}

export function EventsTable() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null)
  const [sortAscending, setSortAscending] = useState<boolean | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false })
    if (data) setEvents(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    // Check for existing bookings first
    const { count } = await supabase
      .from('booking_requests')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)

    const bookingsCount = count || 0
    
    let confirmMessage = 'Are you sure you want to delete this event?'
    if (bookingsCount > 0) {
      confirmMessage = `WARNING: This event currently has ${bookingsCount} booking(s) associated with it.\n\nDeleting this event will permanently delete all these bookings as well. Are you absolutely sure you want to proceed?`
    }

    if (!confirm(confirmMessage)) return
    // Delete associated bookings first to satisfy foreign key constraint
    await supabase.from('booking_requests').delete().eq('event_id', id)
    
    // Extract media paths to delete from storage
    const eventToDelete = events.find(e => e.id === id)
    // Note: We skip deleting media from ImageKit to preserve historical backups
    // as it requires specific fileIds which we don't store in the database currently.
    
    const { error } = await supabase.from('events').delete().eq('id', id)
    
    if (error) {
      alert('Failed to delete event: ' + error.message)
      return
    }
    
    setEvents(events.filter(e => e.id !== id))
    router.refresh()
  }

  const handleEdit = (event: EventRecord) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">All Events</h2>
        <button 
          onClick={handleAddNew}
          className="bg-accent hover:bg-accent-warm text-background px-4 py-2 rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(200,232,107,0.3)]"
        >
          + Add New Event
        </button>
      </div>

      <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-foreground-secondary uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    Date & Time
                    <button 
                      onClick={() => setSortAscending(prev => prev === null ? true : prev === true ? false : null)}
                      className="text-foreground-secondary hover:text-foreground transition-colors"
                      title="Sort by Date"
                    >
                      <svg className={`w-4 h-4 ${sortAscending === true ? 'text-accent' : ''} ${sortAscending === false ? 'rotate-180 text-accent' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    </button>
                  </div>
                </th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Booking Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...events].sort((a, b) => {
                if (sortAscending === null) return 0;
                // Try parsing the date, fallback to 0 if invalid
                const dateA = new Date(a.date).getTime() || 0;
                const dateB = new Date(b.date).getTime() || 0;
                return sortAscending ? dateA - dateB : dateB - dateA;
              }).map((event) => (
                <tr key={event.id} className="hover:bg-surface transition-colors group">
                  <td className="px-6 py-4 text-gray-300">
                    <p>{event.created_at ? new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                    <p className="text-xs text-gray-500">{event.created_at ? new Date(event.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.price ? formatPrice(event.price) : 'Free / TBD'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <p>{event.date}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">{event.city}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 capitalize">{event.booking_type}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(event)} className="text-blue-400 hover:text-blue-300 mr-4">Edit</button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No events found. Click "Add New Event" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <EventModal 
          event={editingEvent} 
          onClose={() => setIsModalOpen(false)} 
          onSave={(savedEvent) => {
            if (editingEvent) {
              setEvents(events.map(e => e.id === savedEvent.id ? savedEvent : e))
            } else {
              setEvents([savedEvent, ...events])
            }
            setIsModalOpen(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

import { DatePicker } from "../ui/DatePicker"
import { TimePicker } from "../ui/TimePicker"

function parseDateString(dateStr: string) {
  if (!dateStr) return '';
  if (dateStr.includes('-') && dateStr.split('-').length === 3) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateString(yyyyMmDd: string) {
  if (!yyyyMmDd) return '';
  if (!yyyyMmDd.includes('-')) return yyyyMmDd;
  const [y, m, d] = yyyyMmDd.split('-');
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function EventModal({ event, onClose, onSave }: { event: EventRecord | null, onClose: () => void, onSave: (e: EventRecord) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Dynamic states
  const [includes, setIncludes] = useState<string[]>(event?.includes?.length ? event.includes : [''])
  const [runOfShow, setRunOfShow] = useState<{time: string, title: string, desc: string}[]>(event?.run_of_show?.length ? event.run_of_show : [{ time: '', title: '', desc: '' }])
  const [bookingType, setBookingType] = useState(event?.booking_type || 'platform')
  const initialPlatforms = event?.booking_links 
    ? Object.entries(event.booking_links).map(([name, url]) => ({ name, url }))
    : [{ name: '', url: '' }]
  const [platforms, setPlatforms] = useState<{name: string, url: string}[]>(initialPlatforms)
  const [eventDate, setEventDate] = useState(() => parseDateString(event?.date || ''))
  const [imageUrl, setImageUrl] = useState(event?.image || '')
  const [videoUrl, setVideoUrl] = useState(event?.video || '')
  const [qrUrl, setQrUrl] = useState(event?.qr_code || '')
  const [isUploading, setIsUploading] = useState(false)
  
  // Split time into start and end for picker
  const [startTime, setStartTime] = useState(() => {
    if (!event?.time) return '10:00 PM';
    return event.time.split('-')[0]?.trim() || '10:00 PM';
  })
  const [endTime, setEndTime] = useState(() => {
    if (!event?.time) return '12:00 AM';
    return event.time.split('-')[1]?.trim() || '12:00 AM';
  })

  const supabase = createClient()
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'qr') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", `/events/${type}s`)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      
      if (type === 'image') setImageUrl(data.url)
      if (type === 'video') setVideoUrl(data.url)
      if (type === 'qr') setQrUrl(data.url)
    } catch (error: any) {
      alert(`Error uploading ${type}: ` + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    // Validation
    if (!imageUrl.trim()) {
      alert('Event Image is required.');
      setIsSubmitting(false);
      return;
    }
    
    if (bookingType === 'platform' && !platforms.some(p => p.name.trim() && p.url.trim())) {
      alert('Please provide at least one booking platform with a valid name and URL.');
      setIsSubmitting(false);
      return;
    }
    
    if (bookingType === 'qr' && !qrUrl.trim()) {
      alert('Please upload a Payment QR Code for QR booking type.');
      setIsSubmitting(false);
      return;
    }
    
    const booking_links: Record<string, string> = {}
    platforms.forEach(p => {
      if (p.name.trim() && p.url.trim()) {
        booking_links[p.name.trim()] = p.url.trim()
      }
    })
    
    const payload = {
      title: formData.get('title'),
      date: formatDateString(eventDate) || formData.get('date'), // fallback if empty
      time: `${startTime} - ${endTime}`,
      price: formData.get('price'),
      city: formData.get('city'),
      location: formData.get('location'),
      location_url: formData.get('location_url'),
      image: imageUrl,
      video: videoUrl,
      qr_code: qrUrl,
      preview_desc: formData.get('preview_desc'),
      preview_highlight: formData.get('preview_highlight'),
      full_desc: formData.get('full_desc'),
      booking_type: bookingType,
      includes: includes.filter(i => i.trim() !== ''),
      run_of_show: runOfShow.filter(r => r.time.trim() !== '' || r.title.trim() !== ''),
      booking_links
    }

    if (event?.id) {
      const { data, error } = await supabase.from('events').update(payload).eq('id', event.id).select().single()
      if (!error && data) onSave(data)
    } else {
      const { data, error } = await supabase.from('events').insert([payload]).select().single()
      if (!error && data) onSave(data)
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-border w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-black/20">
          <h3 className="text-xl font-bold text-foreground">{event ? 'Edit Event' : 'Add New Event'}</h3>
          <button type="button" onClick={onClose} className="text-foreground-secondary hover:text-foreground">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-sm">
          {/* Basic Info */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground-secondary mb-1">Title</label>
                <input name="title" defaultValue={event?.title} required className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-foreground-secondary mb-1">Date</label>
                <DatePicker 
                  value={eventDate} 
                  onChange={setEventDate} 
                  className="bg-foreground/ border-border"
                  popDirection="down"
                  allowPastDates={true}
                />
              </div>
              <div>
                <label className="block text-foreground-secondary mb-1">Time</label>
                <div className="flex items-center gap-2">
                  <TimePicker 
                    value={startTime} 
                    onChange={setStartTime} 
                    className="bg-foreground/ border-border" 
                    popDirection="down"
                  />
                  <span className="text-gray-500">-</span>
                  <TimePicker 
                    value={endTime} 
                    onChange={setEndTime} 
                    className="bg-foreground/ border-border" 
                    popDirection="down"
                  />
                </div>
              </div>
              <div>
                <label className="block text-foreground-secondary mb-1">Location</label>
                <input name="location" defaultValue={event?.location} required className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-foreground-secondary mb-1">City</label>
                <input name="city" defaultValue={event?.city} required className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-foreground-secondary mb-1">Price (Optional)</label>
                <input name="price" defaultValue={event?.price} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-foreground-secondary mb-1">Location URL (Optional)</label>
                <input name="location_url" type="url" defaultValue={event?.location_url} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
            </div>
          </div>

          {/* Media & Assets */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Media & Assets</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground-secondary mb-1">Event Poster Image <span className="text-red-400">*</span></label>
                <div className="flex gap-2">
                  <input 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    placeholder="https://..." 
                    required 
                    className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                  />
                  <label className="cursor-pointer bg-foreground/ hover:bg-foreground/ px-4 py-2.5 rounded-lg text-foreground text-sm font-bold flex items-center transition-colors">
                    {isUploading ? '...' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={isUploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-foreground-secondary mb-1">Cinematic Promo Video</label>
                <div className="flex gap-2">
                  <input 
                    value={videoUrl} 
                    onChange={(e) => setVideoUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                  />
                  <label className="cursor-pointer bg-foreground/ hover:bg-foreground/ px-4 py-2.5 rounded-lg text-foreground text-sm font-bold flex items-center transition-colors">
                    {isUploading ? '...' : 'Upload'}
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} disabled={isUploading} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Descriptions</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-foreground-secondary mb-1">Preview Description</label>
                <textarea name="preview_desc" defaultValue={event?.preview_desc} required rows={3} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-foreground-secondary mb-1">Preview Highlight</label>
                <input name="preview_highlight" defaultValue={event?.preview_highlight} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" placeholder="e.g. Early Bird Discounts apply!" />
              </div>
              <div>
                <label className="block text-foreground-secondary mb-1">Full Description</label>
                <textarea name="full_desc" defaultValue={event?.full_desc} required rows={6} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
            </div>
          </div>

          {/* Booking & Registration */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Booking & Registration</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-foreground-secondary mb-1">Booking Type</label>
                <select 
                  value={bookingType} 
                  onChange={(e) => setBookingType(e.target.value as 'platform' | 'qr' | 'contact')}
                  className="w-full md:w-1/2 bg-[#1a1a1a] border border-border rounded-lg p-2.5 text-foreground appearance-none"
                >
                  <option value="platform">External Platform (BookMyShow, District)</option>
                  <option value="qr">Manual QR Code Upload</option>
                  <option value="contact">Email Contact Only</option>
                </select>
              </div>
              
              {bookingType === 'platform' && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-foreground-secondary mb-1">Booking Platforms</label>
                    <button 
                      type="button" 
                      onClick={() => setPlatforms([...platforms, { name: '', url: '' }])}
                      className="text-accent hover:text-accent-warm text-sm font-bold flex items-center gap-1"
                    >
                      + Add Platform
                    </button>
                  </div>
                  {platforms.map((platform, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input 
                          value={platform.name} 
                          onChange={(e) => {
                            const newPlatforms = [...platforms]
                            newPlatforms[index].name = e.target.value
                            setPlatforms(newPlatforms)
                          }}
                          placeholder="Platform Name (e.g. BookMyShow)" 
                          className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground mb-2" 
                        />
                      </div>
                      <div className="flex-[2]">
                        <input 
                          value={platform.url} 
                          onChange={(e) => {
                            const newPlatforms = [...platforms]
                            newPlatforms[index].url = e.target.value
                            setPlatforms(newPlatforms)
                          }}
                          placeholder="Booking URL (https://...)" 
                          className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setPlatforms(platforms.filter((_, i) => i !== index))}
                        className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg mt-0.5"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              {bookingType === 'qr' && (
                <div className="pt-2">
                  <label className="block text-foreground-secondary mb-1">Payment QR Code Image</label>
                  <div className="flex gap-2">
                    <input 
                      value={qrUrl} 
                      onChange={(e) => setQrUrl(e.target.value)} 
                      placeholder="https://..." 
                      className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                    />
                    <label className="cursor-pointer bg-foreground/ hover:bg-foreground/ px-4 py-2.5 rounded-lg text-foreground text-sm font-bold flex items-center transition-colors">
                      {isUploading ? '...' : 'Upload'}
                      {/* Using any cast on type parameter since handleFileUpload type is constrained to 'image' | 'video', but in JS it's fine or I will pass 'qr' as any */}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'qr' as any)} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* What's Included */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">What's Included</h4>
            <div className="space-y-3">
              {includes.map((inc, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input 
                    value={inc} 
                    onChange={(e) => {
                      const newInc = [...includes]
                      newInc[index] = e.target.value
                      setIncludes(newInc)
                    }}
                    placeholder="e.g. Premium yoga mat & towel"
                    className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setIncludes(includes.filter((_, i) => i !== index))}
                    className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg"
                  >✕</button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setIncludes([...includes, ''])}
                className="text-accent hover:text-accent-warm text-sm font-bold flex items-center gap-1"
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* Run of Show */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Run of Show (Schedule)</h4>
            <div className="space-y-4">
              {runOfShow.map((step, index) => (
                <div key={index} className="flex gap-3 items-start bg-foreground/ p-4 rounded-xl border border-border">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-500 mb-1 text-xs">Time</label>
                        <TimePicker 
                          value={step.time} 
                          onChange={(val) => {
                            const newSteps = [...runOfShow]
                            newSteps[index].time = val
                            setRunOfShow(newSteps)
                          }}
                          className="bg-foreground/ border-border p-2" 
                          popDirection="up"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1 text-xs">Title</label>
                        <input 
                          value={step.title} 
                          onChange={(e) => {
                            const newSteps = [...runOfShow]
                            newSteps[index].title = e.target.value
                            setRunOfShow(newSteps)
                          }}
                          placeholder="e.g. Doors open"
                          className="w-full bg-foreground/ border border-border rounded-lg p-2 text-foreground text-sm" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1 text-xs">Description</label>
                      <input 
                        value={step.desc} 
                        onChange={(e) => {
                          const newSteps = [...runOfShow]
                          newSteps[index].desc = e.target.value
                          setRunOfShow(newSteps)
                        }}
                        placeholder="e.g. Settle into the darkness"
                        className="w-full bg-foreground/ border border-border rounded-lg p-2 text-foreground text-sm" 
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setRunOfShow(runOfShow.filter((_, i) => i !== index))}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg mt-5"
                  >✕</button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setRunOfShow([...runOfShow, { time: '', title: '', desc: '' }])}
                className="text-accent hover:text-accent-warm text-sm font-bold flex items-center gap-1"
              >
                + Add Schedule Step
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-foreground-secondary hover:text-foreground">Cancel</button>
            <button type="submit" disabled={isSubmitting || isUploading} className="px-8 py-2.5 rounded-lg bg-accent text-background font-bold hover:bg-accent-warm disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
