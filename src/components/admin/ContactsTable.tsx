"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader } from '@/components/ui/Loader'

export type ContactInfo = {
  id: string
  whatsapp: string
  email: string
  partnerships_email: string
  phone: string
}

export type SocialLink = {
  id: string
  platform: string
  url: string
}

export function ContactsTable() {
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [socials, setSocials] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [isAddingSocial, setIsAddingSocial] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [
      { data: contactData },
      { data: socialData }
    ] = await Promise.all([
      supabase.from('contacts').select('*').limit(1).single(),
      supabase.from('social_links').select('*').order('created_at', { ascending: true })
    ])

    if (contactData) setContact(contactData)
    if (socialData) setSocials(socialData)
    
    setLoading(false)
  }

  const handleUpdateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!contact) return
    
    const formData = new FormData(e.currentTarget)
    const updates = {
      whatsapp: formData.get('whatsapp') as string,
      email: formData.get('email') as string,
      partnerships_email: formData.get('partnerships_email') as string,
      phone: formData.get('phone') as string,
    }

    const { error } = await supabase.from('contacts').update(updates).eq('id', contact.id)
    if (error) {
      alert('Error updating contacts: ' + error.message)
    } else {
      setIsEditingContact(false)
      fetchData()
    }
  }

  const handleAddSocial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newSocial = {
      platform: formData.get('platform') as string,
      url: formData.get('url') as string,
    }

    const { error } = await supabase.from('social_links').insert(newSocial)
    if (error) {
      alert('Error adding social link: ' + error.message)
    } else {
      setIsAddingSocial(false)
      fetchData()
    }
  }

  const handleDeleteSocial = async (id: string) => {
    if (!confirm('Delete this social link?')) return
    const { error } = await supabase.from('social_links').delete().eq('id', id)
    if (error) {
      alert('Error deleting: ' + error.message)
    } else {
      fetchData()
    }
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-12">
      
      {/* Contact Details Section */}
      <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-heading text-foreground">Core Contact Info</h2>
          <button 
            onClick={() => setIsEditingContact(!isEditingContact)}
            className="bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            {isEditingContact ? 'Cancel' : 'Edit Info'}
          </button>
        </div>

        {isEditingContact && contact ? (
          <form onSubmit={handleUpdateContact} className="space-y-4 mb-6 bg-background/80 p-6 rounded-xl border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-sm mb-1">General Email</label>
                <input required name="email" defaultValue={contact.email} type="email" className="w-full bg-background border border-border rounded-lg p-2 text-foreground" />
              </div>
              <div>
                <label className="block text-text-secondary text-sm mb-1">Partnerships Email</label>
                <input required name="partnerships_email" defaultValue={contact.partnerships_email} type="email" className="w-full bg-background border border-border rounded-lg p-2 text-foreground" />
              </div>
              <div>
                <label className="block text-text-secondary text-sm mb-1">Phone Number</label>
                <input required name="phone" defaultValue={contact.phone} type="text" className="w-full bg-background border border-border rounded-lg p-2 text-foreground" />
              </div>
              <div>
                <label className="block text-text-secondary text-sm mb-1">WhatsApp Number</label>
                <input required name="whatsapp" defaultValue={contact.whatsapp} type="text" className="w-full bg-background border border-border rounded-lg p-2 text-foreground" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-accent hover:bg-accent-warm px-6 py-2 rounded-lg text-background text-sm font-bold transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        ) : contact ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background/80 p-4 rounded-xl border border-border">
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">General Email</p>
              <p className="font-medium text-foreground">{contact.email}</p>
            </div>
            <div className="bg-background/80 p-4 rounded-xl border border-border">
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Partnerships Email</p>
              <p className="font-medium text-foreground">{contact.partnerships_email}</p>
            </div>
            <div className="bg-background/80 p-4 rounded-xl border border-border">
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Phone Number</p>
              <p className="font-medium text-foreground">{contact.phone}</p>
            </div>
            <div className="bg-background/80 p-4 rounded-xl border border-border">
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">WhatsApp Number</p>
              <p className="font-medium text-foreground">{contact.whatsapp}</p>
            </div>
          </div>
        ) : (
          <p className="text-red-400">No contact info found. Make sure you ran the SQL seed.</p>
        )}
      </div>

      {/* Social Links Section */}
      <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-heading text-foreground">Social Links</h2>
          <button 
            onClick={() => setIsAddingSocial(!isAddingSocial)}
            className="bg-accent hover:bg-accent-warm text-background px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            {isAddingSocial ? 'Cancel' : '+ Add Social'}
          </button>
        </div>

        {isAddingSocial && (
          <form onSubmit={handleAddSocial} className="space-y-4 mb-6 bg-background/80 p-6 rounded-xl border border-border animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-sm mb-1">Platform</label>
                <select required name="platform" className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground">
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-sm mb-1">Profile URL / Number</label>
                <input required name="url" type="text" placeholder="https://... or Phone Number" className="w-full bg-background border border-border rounded-lg p-2 text-foreground" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-accent hover:bg-accent-warm px-6 py-2 rounded-lg text-background text-sm font-bold transition-colors">
                Add Link
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-text-secondary uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4 w-full">URL</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {socials.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-text-secondary">
                    No social links added yet.
                  </td>
                </tr>
              ) : (
                socials.map((social) => (
                  <tr key={social.id} className="hover:bg-surface transition-colors group">
                    <td className="px-6 py-4 font-medium capitalize text-foreground">
                      {social.platform}
                    </td>
                    <td className="px-6 py-4">
                      <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {social.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteSocial(social.id)}
                        className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
