'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { EventsTable } from './EventsTable'
import { BookingRequestsTable } from './BookingRequestsTable'
import { HostRequestsTable } from './HostRequestsTable'
import { ReviewsTable } from './ReviewsTable'
import { GalleryTable } from './GalleryTable'
import { ChannelTable } from './ChannelTable'
import { ContactsTable } from './ContactsTable'

import { createClient } from '@/utils/supabase/client'
import { Loader } from '@/components/ui/Loader'

type DashboardStats = {
  totalSubscribers: number
  totalReviews: number
  totalHostRequests: number
  pendingHostRequests: number
  totalBookings: number
  pendingBookings: number
  eventsData: any[]
}

export function AdminDashboardClient({ 
  userEmail 
}: { 
  userEmail: string 
}) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (activeTab === 'dashboard' && !dashboardStats) {
      fetchDashboardStats()
    }
  }, [activeTab])

  const fetchDashboardStats = async () => {
    const [
      { count: totalSubscribers },
      { count: totalReviews },
      { count: totalBookings },
      { count: pendingBookings },
      { count: totalHostRequests },
      { count: pendingHostRequests },
      { data: eventsData }
    ] = await Promise.all([
      supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('booking_requests').select('*', { count: 'exact', head: true }),
      supabase.from('booking_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('personalized_events').select('*', { count: 'exact', head: true }),
      supabase.from('personalized_events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('events').select('id, title, date, booking_requests ( id )').order('created_at', { ascending: false }).limit(5)
    ])

    setDashboardStats({
      totalSubscribers: totalSubscribers || 0,
      totalReviews: totalReviews || 0,
      totalBookings: totalBookings || 0,
      pendingBookings: pendingBookings || 0,
      totalHostRequests: totalHostRequests || 0,
      pendingHostRequests: pendingHostRequests || 0,
      eventsData: eventsData || []
    })
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground relative font-sans overflow-hidden w-full">
      {/* Sidebar Navigation */}
      <div className="relative z-10 flex">
        <AdminSidebar userEmail={userEmail} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10">
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-6xl mx-auto w-full">
            
            {activeTab === 'dashboard' && !dashboardStats && <Loader />}
            
            {activeTab === 'dashboard' && dashboardStats && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-10">
                <div>
                  <h1 className="text-3xl font-extrabold text-foreground font-manrope tracking-tight">Dashboard Overview</h1>
                  <p className="mt-2 text-base text-foreground-secondary max-w-2xl">
                    Welcome to your control panel. Monitor engagement, manage upcoming events, and review guest bookings all in one place.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Action Pending Stat Card */}
                  <div className="group relative bg-surface backdrop-blur-xl rounded-2xl p-6 border border-border hover:border-accent/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--color-accent),0.15)] overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-50 transition-opacity">
                      <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-foreground-secondary uppercase tracking-widest mb-2 relative z-10">Booking Requests</p>
                    <div className="flex items-baseline gap-3 relative z-10">
                      <p className="text-5xl font-black text-foreground">{dashboardStats.totalBookings || 0}</p>
                      <span className="text-sm text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-md">{dashboardStats.pendingBookings || 0} pending</span>
                    </div>
                  </div>

                  {/* Host Requests Stat Card */}
                  <div className="group relative bg-surface backdrop-blur-xl rounded-2xl p-6 border border-border hover:border-accent/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--color-accent),0.1)] overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-50 transition-opacity">
                      <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-foreground-secondary uppercase tracking-widest mb-2 relative z-10">Host Requests</p>
                    <div className="flex items-baseline gap-3 relative z-10">
                      <p className="text-5xl font-black text-foreground">{dashboardStats.totalHostRequests || 0}</p>
                      <span className="text-sm text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-md">{dashboardStats.pendingHostRequests || 0} pending</span>
                    </div>
                  </div>
                  
                  {/* Subscribers Stat Card */}
                  <div className="group relative bg-surface backdrop-blur-xl rounded-2xl p-6 border border-border hover:border-accent/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--color-accent),0.1)] overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-50 transition-opacity">
                      <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-foreground-secondary uppercase tracking-widest mb-2 relative z-10">Total Subscribers</p>
                    <div className="flex items-baseline gap-3 relative z-10">
                      <p className="text-5xl font-black text-foreground">{dashboardStats.totalSubscribers || 0}</p>
                      <span className="text-sm text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-md">All time</span>
                    </div>
                  </div>

                  {/* Reviews Stat Card */}
                  <div className="group relative bg-surface backdrop-blur-xl rounded-2xl p-6 border border-border hover:border-accent/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--color-accent),0.1)] overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-50 transition-opacity">
                      <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-foreground-secondary uppercase tracking-widest mb-2 relative z-10">Total Reviews</p>
                    <div className="flex items-baseline gap-3 relative z-10">
                      <p className="text-5xl font-black text-foreground">{dashboardStats.totalReviews || 0}</p>
                      <span className="text-sm text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-md">All time</span>
                    </div>
                  </div>
                </div>
                
                {/* Event Previews Section */}
                <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden mt-10">
                  <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Recent Events Preview</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-foreground/ border-b border-border text-foreground-secondary">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Event Title</th>
                          <th className="px-6 py-4 font-semibold">Date</th>
                          <th className="px-6 py-4 font-semibold text-right">Total Bookings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dashboardStats.eventsData?.map((event: any) => (
                          <tr key={event.id} className="hover:bg-surface transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-semibold text-foreground">{event.title}</span>
                            </td>
                            <td className="px-6 py-4 text-foreground-secondary">
                              {event.date}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-accent/10 text-accent font-bold">
                                {event.booking_requests?.length || 0} Bookings
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!dashboardStats.eventsData || dashboardStats.eventsData.length === 0) && (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                              No events found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground font-manrope tracking-tight mb-2">Events Management</h1>
                    <p className="text-foreground-secondary max-w-2xl">
                      Create, edit, and publish your events. These changes will reflect immediately on the public site.
                    </p>
                  </div>
                </div>
                <EventsTable />
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground font-manrope tracking-tight">Booking Requests</h1>
                    <p className="mt-2 text-base text-foreground-secondary max-w-2xl">
                      Review and manage manual booking requests submitted by users for your events. Verify payments using the provided UTR numbers or screenshots.
                    </p>
                  </div>
                </div>
                <BookingRequestsTable />
              </div>
            )}

            {activeTab === 'host-requests' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground font-manrope tracking-tight mb-2">Host Requests</h1>
                    <p className="text-foreground-secondary max-w-2xl">
                      Manage personalized event requests from users. Update statuses as you review them.
                    </p>
                  </div>
                </div>
                <HostRequestsTable />
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground font-manrope tracking-tight mb-2">Reviews Moderation</h1>
                    <p className="text-foreground-secondary max-w-2xl">
                      Manage community reviews. Approve genuine feedback to display on the site or reject spam.
                    </p>
                  </div>
                </div>
                <ReviewsTable />
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground font-manrope tracking-tight mb-2">Gallery Management</h1>
                    <p className="text-foreground-secondary max-w-2xl">
                      Upload and manage images for the public gallery page.
                    </p>
                  </div>
                </div>
                <GalleryTable />
              </div>
            )}

            {activeTab === 'channel' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground font-manrope tracking-tight mb-2">YogaJam Channel Management</h1>
                    <p className="text-foreground-secondary max-w-2xl">
                      Add and manage videos displayed in the YogaJam Channel section on the homepage.
                    </p>
                  </div>
                </div>
                <ChannelTable />
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-extrabold text-foreground font-manrope tracking-tight mb-2">Contacts & Socials</h1>
                    <p className="text-foreground-secondary max-w-2xl">
                      Manage emails, phone numbers, and social media links that appear across the website.
                    </p>
                  </div>
                </div>
                <ContactsTable />
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
