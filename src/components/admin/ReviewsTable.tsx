"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader } from '@/components/ui/Loader'

export type Review = {
  id: string
  name: string
  email: string
  event: string
  rating: number
  review: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export function ReviewsTable() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
    
    // 1. Subscribe to real-time changes on the reviews table
    const channel = supabase
      .channel('reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReviews((prev) => [payload.new as Review, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setReviews((prev) => prev.map(r => r.id === payload.new.id ? (payload.new as Review) : r))
          } else if (payload.eventType === 'DELETE') {
            setReviews((prev) => prev.filter(r => r.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setReviews(data)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    // Optimistic UI update
    setReviews((prev) => prev.map(r => r.id === id ? { ...r, status } : r))
    
    // Database update
    await supabase.from('reviews').update({ status }).eq('id', id)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 text-accent">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-accent' : 'text-foreground/10'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const handleAddReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newReview = {
      name: formData.get('name') as string,
      email: formData.get('email') as string || 'admin@yogajam.fit',
      event: formData.get('event') as string || 'General',
      rating: Number(formData.get('rating')) || 5,
      review: formData.get('review') as string,
      status: 'approved'
    }
    
    const { error } = await supabase.from('reviews').insert(newReview)
    if (error) {
      alert('Error adding review: ' + error.message)
    } else {
      setIsAdding(false)
      fetchReviews()
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-accent hover:bg-accent-warm px-4 py-2 rounded-lg text-background text-sm font-bold flex items-center transition-colors"
        >
          {isAdding ? 'Cancel' : '+ Add Review Manually'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold font-heading mb-4">Add a Review</h3>
          <form onSubmit={handleAddReview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground-secondary text-sm mb-1">Author Name *</label>
                <input required name="name" type="text" className="w-full bg-background border border-border rounded-lg p-2 text-foreground" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-foreground-secondary text-sm mb-1">Rating (1-5)</label>
                <input required name="rating" type="number" min="1" max="5" defaultValue="5" className="w-full bg-background border border-border rounded-lg p-2 text-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-foreground-secondary text-sm mb-1">Review Text *</label>
              <textarea required name="review" rows={3} className="w-full bg-background border border-border rounded-lg p-2 text-foreground" placeholder="It was amazing..." />
            </div>
            <button type="submit" className="bg-accent hover:bg-accent-warm px-4 py-2 rounded-lg text-background text-sm font-bold w-full transition-colors">
              Submit Review
            </button>
          </form>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-12 text-center">
          <p className="text-foreground-secondary">No reviews have been submitted yet.</p>
        </div>
      ) : (
        <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-black/20 text-foreground-secondary uppercase tracking-wider text-[11px] font-bold">
            <tr>
              <th className="px-6 py-4">Guest</th>
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4 w-full">Review</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-surface transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{review.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{review.email}</p>
                </td>
                <td className="px-6 py-4 text-foreground-secondary">{review.event}</td>
                <td className="px-6 py-4">{renderStars(review.rating)}</td>
                <td className="px-6 py-4">
                  <p className="text-gray-300 whitespace-normal line-clamp-2 max-w-sm">
                    {review.review}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    review.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    review.status === 'approved' ? 'bg-accent/10 text-accent border-accent/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {review.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    {review.status !== 'approved' && (
                      <button 
                        onClick={() => updateStatus(review.id, 'approved')}
                        className="text-accent hover:text-accent-hover bg-accent/10 hover:bg-accent/20 p-2 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button 
                        onClick={() => updateStatus(review.id, 'rejected')}
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
      )}
    </div>
  )
}
