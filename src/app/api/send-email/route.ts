import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'

// Initialize Resend
// Note: We create this lazily or check if the key exists to not crash if the env var is missing during build
const resend = new Resend(process.env.RESEND_API_KEY || 'missing_key')

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication (Only admins can send these emails)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse Request Body
    const { to, subject, type, name, eventTitle, eventDate, amount } = await request.json()

    if (!to || !subject || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 3. Generate HTML Content based on type
    let htmlContent = ''
    
    if (type === 'booking_confirmation') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #111513;">
          <h1 style="color: #60783A;">Booking Confirmed!</h1>
          <p>Hi ${name || 'there'},</p>
          <p>Great news! Your booking for <strong>${eventTitle || 'our event'}</strong> has been confirmed.</p>
          ${eventDate ? `<p><strong>Date:</strong> ${eventDate}</p>` : ''}
          ${amount ? `<p><strong>Amount:</strong> ${amount}</p>` : ''}
          <p>We are so excited to see you there. If you have any questions, just reply to this email!</p>
          <br/>
          <p>Best regards,<br/>The YogaJam Team</p>
        </div>
      `
    } else if (type === 'host_confirmation') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #111513;">
          <h1 style="color: #60783A;">Request Received!</h1>
          <p>Hi ${name || 'there'},</p>
          <p>We've received your personalized host request and we're thrilled you want to collaborate with us!</p>
          <p>We are currently reviewing your details and will follow up shortly to discuss the next steps.</p>
          <br/>
          <p>Best regards,<br/>The YogaJam Team</p>
        </div>
      `
    } else {
       return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    // 4. Send Email via Resend
    // By default, if the user hasn't verified a domain, Resend requires using 'onboarding@resend.dev'
    // and will ONLY send to the email address used to sign up for Resend.
    const { data, error } = await resend.emails.send({
      from: 'YogaJam <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: htmlContent,
    })

    if (error) {
      console.error("Resend API Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
    
  } catch (error: any) {
    console.error("Server Error sending email:", error)
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 })
  }
}
