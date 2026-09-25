"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader } from '@/components/ui/Loader'
import { FullscreenLoader } from '@/components/ui/FullscreenLoader'

export type ChannelVideo = {
  id: string
  video_url: string
  created_at: string
}

export function ChannelTable() {
  const [videos, setVideos] = useState<ChannelVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const { data } = await supabase
      .from('channel')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (data) {
      setVideos(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    setLoadingMessage("Removing video from channel...")
    try {
      const videoToDelete = videos.find(v => v.id === id);

      const { error } = await supabase.from('channel').delete().eq('id', id)
      if (error) {
        alert('Error deleting video: ' + error.message)
      } else {
        if (videoToDelete && videoToDelete.video_url) {
          await fetch('/api/imagekit-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: videoToDelete.video_url })
          }).catch(err => console.error('Failed to delete from ImageKit:', err));
        }
        fetchVideos()
      }
    } finally {
      setLoadingMessage(null)
    }
  }

  const handleAddVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingMessage("Adding video to channel...")
    
    try {
      const formData = new FormData(e.currentTarget)
      
      const newVideo = {
        video_url: formData.get('video_url') as string,
      }
      
      const { error } = await supabase.from('channel').insert(newVideo)
      if (error) {
        alert('Error adding video: ' + error.message)
      } else {
        setIsAdding(false)
        fetchVideos()
      }
    } finally {
      setLoadingMessage(null)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {loadingMessage && <FullscreenLoader message={loadingMessage} />}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-accent hover:bg-accent-warm px-4 py-2 rounded-lg text-background text-sm font-bold flex items-center transition-colors"
        >
          {isAdding ? 'Cancel' : '+ Add Channel Video'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold font-heading mb-4">Add a New Video to Channel</h3>
          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <label className="block text-foreground-secondary text-sm mb-1">Video URL (e.g. ImageKit or Supabase URL) *</label>
              <input required name="video_url" type="url" className="w-full bg-background border border-border rounded-lg p-2 text-foreground" placeholder="https://..." />
            </div>
            <button type="submit" className="bg-accent hover:bg-accent-warm px-4 py-2 rounded-lg text-background text-sm font-bold w-full transition-colors">
              Add Video
            </button>
          </form>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-12 text-center">
          <p className="text-foreground-secondary">No videos have been added to the channel yet.</p>
        </div>
      ) : (
        <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/20 text-foreground-secondary uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-4">Video Preview</th>
                  <th className="px-6 py-4 w-full">URL</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {videos.map((video) => (
                  <tr key={video.id} className="hover:bg-surface transition-colors group">
                    <td className="px-6 py-4">
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="block relative group/video cursor-pointer w-fit rounded-md overflow-hidden">
                        <video src={video.video_url.includes('ik.imagekit.io') && !video.video_url.includes('tr=') ? video.video_url + (video.video_url.includes('?') ? '&' : '?') + 'tr=orig-true' : video.video_url} className="w-32 h-20 object-cover bg-black transition-transform duration-300 group-hover/video:scale-105" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/video:opacity-100 transition-opacity">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-accent transition-colors truncate max-w-sm block">
                        {video.video_url}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(video.id)}
                        className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
