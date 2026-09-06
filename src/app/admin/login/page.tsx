"use client"

import { useState, Suspense, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(''))
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  
  const otpInputs = useRef<(HTMLInputElement | null)[]>([])

  const supabase = createClient()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // 1. Verify if email exists in public.admins
    const { data: adminUser, error: adminError } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email.trim())
      .single()

    if (adminError || !adminUser) {
      setError("This email is not authorized as an administrator.")
      setLoading(false)
      return
    }

    // 2. Send OTP if authorized
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    })

    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
      setMessage('A passcode has been sent to your email.')
      // Auto-focus first OTP input slightly after render
      setTimeout(() => {
        otpInputs.current[0]?.focus()
      }, 100)
    }
    setLoading(false)
  }

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    
    const newOtpArray = [...otpArray]
    newOtpArray[index] = value.substring(value.length - 1) // Only take the last digit entered
    setOtpArray(newOtpArray)

    // Move to next input if value is entered
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      otpInputs.current[index - 1]?.focus()
    } else if (e.key === 'Enter') {
      if (otpArray.every(val => val !== '')) {
         handleVerifyOtp()
      }
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '').split('')
    if (pastedData.length === 0) return
    
    const newOtpArray = [...otpArray]
    pastedData.forEach((char, i) => {
      if (i < 6) newOtpArray[i] = char
    })
    setOtpArray(newOtpArray)
    
    // Focus next empty input or last input
    const nextEmptyIndex = newOtpArray.findIndex(val => val === '')
    if (nextEmptyIndex !== -1) {
      otpInputs.current[nextEmptyIndex]?.focus()
    } else {
      otpInputs.current[5]?.focus()
    }
  }

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const token = otpArray.join('')
    if (token.length !== 6) {
      setError('Please enter a 6-digit code.')
      return
    }
    
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: 'email',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Hard refresh to ensure layout triggers auth check
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Cinematic background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-white font-manrope">
          YogaJam
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Admin Portal Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/[0.03] backdrop-blur-xl py-10 px-6 sm:rounded-3xl sm:px-10 border border-white/[0.08] shadow-2xl">
          {urlError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm backdrop-blur-md">
              {urlError}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm backdrop-blur-md">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 bg-primary-500/10 border border-primary-500/20 text-primary-400 p-4 rounded-xl text-sm backdrop-blur-md">
              {message}
            </div>
          )}

          {step === 'email' ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.1] rounded-xl shadow-sm placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-white/20 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505] focus:ring-white/50 disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:border-white/20 transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full ease-out" />
                  <span className="relative flex items-center justify-center gap-2 tracking-wide">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      <>
                        Continue with Email
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-medium text-gray-300 text-center mb-6">
                  Enter the 6-digit code sent to {email}
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpArray.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="\d{1}"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-white/[0.05] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || otpArray.some(val => !val)}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-white/20 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505] focus:ring-white/50 disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:border-white/20 transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full ease-out" />
                  <span className="relative flex items-center justify-center gap-2 tracking-wide">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Verify Passcode
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
              <div className="text-center pt-2">
                 <button 
                  type="button" 
                  onClick={() => {
                    setStep('email')
                    setOtpArray(Array(6).fill(''))
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                 >
                   Use a different email
                 </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 font-sans">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
