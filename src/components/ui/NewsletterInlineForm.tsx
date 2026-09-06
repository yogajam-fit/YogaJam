"use client"

import * as React from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "./Button"

export function NewsletterInlineForm() {
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setStatus('loading')
    const supabase = createClient()
    
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: email.trim(), source: 'empty_events_state' }])
      
    if (error) {
      if (error.code === '23505') {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center animate-in zoom-in duration-300">
        <p className="text-accent font-semibold flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          You're on the list! We'll be in touch.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
      <div className="relative flex-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === 'loading'}
          className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground-secondary/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all disabled:opacity-50"
        />
      </div>
      <Button 
        type="submit" 
        disabled={status === 'loading'}
        className="h-[46px] px-8 bg-accent text-background font-bold hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(200,232,107,0.2)] whitespace-nowrap"
      >
        {status === 'loading' ? 'Subscribing...' : 'Notify Me'}
      </Button>
    </form>
  )
}
