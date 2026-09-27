"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'
import { FullscreenLoader } from '@/components/ui/FullscreenLoader'
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
  image_mobile?: string
  video?: string
  video_mobile?: string
  qr_code?: string
  includes: string[]
  run_of_show: { time: string, title: string, desc: string }[]
  booking_type: 'platform' | 'qr' | 'contact' | 'coming_soon'
  booking_links: Record<string, string> | null
  past_videos?: string[]
  created_at?: string
}

export function EventsTable() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null)
  const [sortAscending, setSortAscending] = useState<boolean | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all')
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
    
    const { error } = await supabase.from('events').delete().eq('id', id)
    
    if (error) {
      alert('Failed to delete event: ' + error.message)
      return
    }

    if (eventToDelete) {
      const urlsToDelete = [];
      if (eventToDelete.video) urlsToDelete.push(eventToDelete.video);
      if (eventToDelete.past_videos && eventToDelete.past_videos.length > 0) {
        urlsToDelete.push(...eventToDelete.past_videos);
      }
      
      for (const url of urlsToDelete) {
        if (url.includes('cloudinary.com')) {
          await fetch('/api/cloudinary-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          }).catch(err => console.error('Failed to delete from Cloudinary:', err));
        } else {
          await fetch('/api/imagekit-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          }).catch(err => console.error('Failed to delete from ImageKit:', err));
        }
      }
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

  const isPastEvent = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    // Compare end of event day with current time
    d.setHours(23, 59, 59, 999)
    return d.getTime() < new Date().getTime()
  }

  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true
    const past = isPastEvent(e.date)
    return filterType === 'past' ? past : !past
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <h2 className="text-2xl font-extrabold font-heading text-foreground tracking-tight">Events</h2>
          
          <div className="flex p-1 bg-surface border border-border/50 rounded-xl shadow-inner relative">
            <button 
              onClick={() => setFilterType('all')} 
              className={`relative z-10 px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${filterType === 'all' ? 'text-background' : 'text-text-secondary hover:text-foreground'}`}
            >
              All Events
              {filterType === 'all' && (
                <div className="absolute inset-0 bg-accent rounded-lg -z-10 shadow-[0_0_15px_rgba(200,232,107,0.4)] animate-in zoom-in-95 duration-200"></div>
              )}
            </button>
            
            <button 
              onClick={() => setFilterType('upcoming')} 
              className={`relative z-10 px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${filterType === 'upcoming' ? 'text-background' : 'text-text-secondary hover:text-foreground'}`}
            >
              Upcoming
              {filterType === 'upcoming' && (
                <div className="absolute inset-0 bg-accent rounded-lg -z-10 shadow-[0_0_15px_rgba(200,232,107,0.4)] animate-in zoom-in-95 duration-200"></div>
              )}
            </button>
            
            <button 
              onClick={() => setFilterType('past')} 
              className={`relative z-10 px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${filterType === 'past' ? 'text-background' : 'text-text-secondary hover:text-foreground'}`}
            >
              Past
              {filterType === 'past' && (
                <div className="absolute inset-0 bg-accent rounded-lg -z-10 shadow-[0_0_15px_rgba(200,232,107,0.4)] animate-in zoom-in-95 duration-200"></div>
              )}
            </button>
          </div>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-accent hover:bg-accent-warm text-background px-4 py-2 rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(200,232,107,0.3)] whitespace-nowrap"
        >
          + Add New Event
        </button>
      </div>

      <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-text-secondary uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    Date & Time
                    <button 
                      onClick={() => setSortAscending(prev => prev === null ? true : prev === true ? false : null)}
                      className="text-text-secondary hover:text-foreground transition-colors"
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
              {[...filteredEvents].sort((a, b) => {
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
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No events found for this filter.
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
  const [imageMobileUrl, setImageMobileUrl] = useState(event?.image_mobile || '')
  const [videoUrl, setVideoUrl] = useState(event?.video || '')
  const [videoMobileUrl, setVideoMobileUrl] = useState(event?.video_mobile || '')
  const [qrUrl, setQrUrl] = useState(event?.qr_code || '')
  const [pastVideos, setPastVideos] = useState<string[]>(event?.past_videos || [])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

  const loadingMessage = isSubmitting 
    ? "Saving your event..." 
    : isUploading 
      ? (uploadProgress || "Uploading your media...") 
      : deletingIndex !== null 
        ? "Removing video..." 
        : null;
  
  const handleRemovePastVideo = async (index: number) => {
    const urlToRemove = pastVideos[index];
    if (urlToRemove && urlToRemove.trim() !== '') {
      const confirmed = confirm("Are you sure you want to delete this video? This will permanently remove it from your cloud storage immediately.");
      if (!confirmed) return;
      
      setDeletingIndex(index);
      try {
        if (urlToRemove.includes('cloudinary.com')) {
          await fetch('/api/cloudinary-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlToRemove })
          });
        } else {
          await fetch('/api/imagekit-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlToRemove })
          });
        }
      } catch (err) {
        console.error("Failed to delete video from cloud:", err);
      } finally {
        setDeletingIndex(null);
      }
    }
    setPastVideos(pastVideos.filter((_, i) => i !== index));
  }
  
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
  
  const handleRemoveMedia = async (url: string, setter: (v: string) => void) => {
    if (!confirm('Remove this media? It will be deleted from the cloud.')) return;
    setter('');
    if (url) {
      await fetch('/api/imagekit-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      }).catch(err => console.error('Failed to delete from ImageKit:', err));
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'image_mobile' | 'video' | 'video_mobile' | 'qr') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    try {
      // Fetch a fresh token — ImageKit tokens are single-use
      const authRes = await fetch("/api/imagekit-auth");
      if (!authRes.ok) {
        throw new Error("Failed to get ImageKit upload authentication");
      }
      const authParams = await authRes.json();

      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileName", safeFileName)
      
      let folderPath = '/events/images'
      if (type.startsWith('video')) folderPath = '/events/videos'
      if (type === 'qr') folderPath = '/qrs' // Segregate QR codes entirely
      
      formData.append("folder", folderPath)
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!)
      formData.append("signature", authParams.signature)
      formData.append("expire", authParams.expire.toString())
      formData.append("token", authParams.token)
      formData.append("useUniqueFileName", "true")

      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errStr = "Upload failed";
        try {
          const errData = await response.json();
          errStr = errData.message || errStr;
        } catch {}
        throw new Error(errStr);
      }

      const data = await response.json()
      const url = data.url
      
      if (type === 'image') setImageUrl(url)
      if (type === 'image_mobile') setImageMobileUrl(url)
      if (type === 'video') setVideoUrl(url)
      if (type === 'video_mobile') setVideoMobileUrl(url)
      if (type === 'qr') setQrUrl(url)
    } catch (error: any) {
      alert(`Error uploading ${type}: ` + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleMultiplePastVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setIsUploading(true)
    const newUrls: string[] = []
    
    try {
      // Get authentication parameters from our new endpoint
      const authRes = await fetch("/api/cloudinary-sign?folder=yogajam/events/past_videos");
      if (!authRes.ok) {
        const err = await authRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to authenticate upload");
      }
      const authParams = await authRes.json();

      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading video ${i + 1} of ${files.length}...`)
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", authParams.folder)
        formData.append("api_key", authParams.api_key)
        formData.append("timestamp", authParams.timestamp)
        formData.append("signature", authParams.signature)

        // Upload DIRECTLY to Cloudinary to bypass Next.js file size limits
        const response = await fetch(`https://api.cloudinary.com/v1_1/${authParams.cloud_name}/video/upload`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.error?.message || `Failed to upload ${file.name}`)
        }

        const data = await response.json()
        newUrls.push(data.secure_url)
      }
      
      setPastVideos(prev => {
        const filtered = prev.filter(v => v.trim() !== '')
        return [...filtered, ...newUrls]
      })
    } catch (error: any) {
      alert(`Error uploading videos: ` + error.message)
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      e.target.value = ''
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
      image_mobile: imageMobileUrl,
      video: videoUrl,
      video_mobile: videoMobileUrl,
      qr_code: qrUrl,
      preview_desc: formData.get('preview_desc'),
      preview_highlight: formData.get('preview_highlight'),
      full_desc: formData.get('full_desc'),
      booking_type: bookingType,
      includes: includes.filter(i => i.trim() !== ''),
      run_of_show: runOfShow.filter(r => r.time.trim() !== '' || r.title.trim() !== ''),
      past_videos: pastVideos.filter(v => v.trim() !== ''),
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
      {loadingMessage && <FullscreenLoader message={loadingMessage} />}
      <div className="bg-[#111] border border-border w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-black/20">
          <h3 className="text-xl font-bold text-foreground">{event ? 'Edit Event' : 'Add New Event'}</h3>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-foreground">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-sm">
          {/* Basic Info */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary mb-1">Title</label>
                <input name="title" defaultValue={event?.title} required className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-text-secondary mb-1">Date</label>
                <DatePicker 
                  value={eventDate} 
                  onChange={setEventDate} 
                  className="bg-foreground/ border-border"
                  popDirection="down"
                  allowPastDates={true}
                />
              </div>
              <div>
                <label className="block text-text-secondary mb-1">Time</label>
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
                <label className="block text-text-secondary mb-1">Location</label>
                <input name="location" defaultValue={event?.location} required className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-text-secondary mb-1">City</label>
                <input name="city" defaultValue={event?.city} required className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-text-secondary mb-1">Price (Optional)</label>
                <input name="price" defaultValue={event?.price} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-text-secondary mb-1">Location URL (Optional)</label>
                <input name="location_url" type="url" defaultValue={event?.location_url} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
            </div>
          </div>

          {/* Media & Assets */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Media & Assets</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary mb-1">Event Poster Image (Desktop/Default) <span className="text-red-400">*</span></label>
                <div className="flex gap-2">
                  <input 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    placeholder="https://..." 
                    required 
                    className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                  />
                  {imageUrl && (
                    <button type="button" onClick={() => handleRemoveMedia(imageUrl, setImageUrl)} title="Remove image" className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">✕</button>
                  )}
                  <label className="cursor-pointer bg-foreground/ hover:bg-foreground/ px-4 py-2.5 rounded-lg text-foreground text-sm font-bold flex items-center transition-colors">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={isUploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-text-secondary mb-1">Mobile Event Poster (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    value={imageMobileUrl} 
                    onChange={(e) => setImageMobileUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                  />
                  {imageMobileUrl && (
                    <button type="button" onClick={() => handleRemoveMedia(imageMobileUrl, setImageMobileUrl)} title="Remove image" className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">✕</button>
                  )}
                  <label className="cursor-pointer bg-foreground/ hover:bg-foreground/ px-4 py-2.5 rounded-lg text-foreground text-sm font-bold flex items-center transition-colors">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image_mobile')} disabled={isUploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-text-secondary mb-1">Promo Video (Desktop/Default)</label>
                <div className="flex gap-2">
                  <input 
                    value={videoUrl} 
                    onChange={(e) => setVideoUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                  />
                  {videoUrl && (
                    <button type="button" onClick={() => handleRemoveMedia(videoUrl, setVideoUrl)} title="Remove video" className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">✕</button>
                  )}
                  <label className="cursor-pointer bg-foreground/ hover:bg-foreground/ px-4 py-2.5 rounded-lg text-foreground text-sm font-bold flex items-center transition-colors">
                    Upload
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} disabled={isUploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-text-secondary mb-1">Mobile Promo Video (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    value={videoMobileUrl} 
                    onChange={(e) => setVideoMobileUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                  />
                  {videoMobileUrl && (
                    <button type="button" onClick={() => handleRemoveMedia(videoMobileUrl, setVideoMobileUrl)} title="Remove video" className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">✕</button>
                  )}
                  <label className="cursor-pointer bg-foreground/ hover:bg-foreground/ px-4 py-2.5 rounded-lg text-foreground text-sm font-bold flex items-center transition-colors">
                    Upload
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video_mobile')} disabled={isUploading} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Past Videos (Only visible if the selected date is in the past) */}
          {(() => {
            const currentSelectedDateStr = formatDateString(eventDate) || (event?.date || '');
            const d = new Date(currentSelectedDateStr);
            d.setHours(23, 59, 59, 999);
            const isCurrentlyPast = !isNaN(d.getTime()) && d.getTime() < new Date().getTime();
            
            if (!isCurrentlyPast) return null;
            
            return (
              <div>
                <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Past Event Videos</h4>
                <p className="text-sm text-text-secondary mb-4">This event is in the past! You can add gallery videos of this event below.</p>
                <div className="space-y-3">
                  {pastVideos.map((vid, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input 
                        value={vid} 
                        onChange={(e) => {
                          const newVids = [...pastVideos]
                          newVids[index] = e.target.value
                          setPastVideos(newVids)
                        }}
                        placeholder="https://... (Video URL)"
                        className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemovePastVideo(index)}
                        disabled={deletingIndex === index}
                        className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg disabled:opacity-70"
                      >✕</button>
                    </div>
                  ))}
                  
                  <div className="flex gap-4 items-center pt-2">
                    <label className="cursor-pointer bg-accent hover:bg-accent-warm px-4 py-2.5 rounded-lg text-background text-sm font-bold flex items-center transition-colors">
                      Upload Multiple Videos
                      <input type="file" accept="video/*" multiple className="hidden" onChange={handleMultiplePastVideoUpload} disabled={isUploading} />
                    </label>
                    <span className="text-text-secondary text-sm">or</span>
                    <button 
                      type="button" 
                      onClick={() => setPastVideos([...pastVideos, ''])}
                      className="text-text-secondary hover:text-foreground text-sm font-bold flex items-center gap-1 transition-colors"
                    >
                      + Add URL Manually
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Descriptions */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Descriptions</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary mb-1">Preview Description</label>
                <textarea name="preview_desc" defaultValue={event?.preview_desc} required rows={3} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
              <div>
                <label className="block text-text-secondary mb-1">Preview Highlight</label>
                <input name="preview_highlight" defaultValue={event?.preview_highlight} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" placeholder="e.g. Early Bird Discounts apply!" />
              </div>
              <div>
                <label className="block text-text-secondary mb-1">Full Description</label>
                <textarea name="full_desc" defaultValue={event?.full_desc} required rows={6} className="w-full bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" />
              </div>
            </div>
          </div>

          {/* Booking & Registration */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Booking & Registration</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary mb-1">Booking Type</label>
                <select 
                  value={bookingType} 
                  onChange={(e) => setBookingType(e.target.value as 'platform' | 'qr' | 'contact' | 'coming_soon')}
                  className="w-full md:w-1/2 bg-[#1a1a1a] border border-border rounded-lg p-2.5 text-foreground appearance-none"
                >
                  <option value="platform">External Platform (BookMyShow, District)</option>
                  <option value="qr">Manual QR Code Upload</option>
                  <option value="contact">Email Contact Only</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>
              
              {bookingType === 'platform' && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-text-secondary mb-1">Booking Platforms</label>
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
                  <label className="block text-text-secondary mb-1">Payment QR Code Image</label>
                  <div className="flex gap-2">
                    <input 
                      value={qrUrl} 
                      onChange={(e) => setQrUrl(e.target.value)} 
                      placeholder="https://..." 
                      className="flex-1 bg-foreground/ border border-border rounded-lg p-2.5 text-foreground" 
                    />
                    {qrUrl && (
                      <button type="button" onClick={() => handleRemoveMedia(qrUrl, setQrUrl)} title="Remove QR code" className="p-2.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">✕</button>
                    )}
                    <label className="cursor-pointer bg-foreground/ hover:bg-foreground/ px-4 py-2.5 rounded-lg text-foreground text-sm font-bold flex items-center transition-colors">
                      Upload
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
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-text-secondary hover:text-foreground">Cancel</button>
            <button type="submit" disabled={isSubmitting || isUploading} className="px-8 py-2.5 rounded-lg bg-accent text-background font-bold hover:bg-accent-warm disabled:opacity-70 transition-colors">
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
