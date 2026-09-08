import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'

// Initialize Resend
// Note: We create this lazily or check if the key exists to not crash if the env var is missing during build
const resend = new Resend(process.env.RESEND_API_KEY || 'missing_key')

export async function POST(request: Request) {
  try {
    // 1. Parse Request Body
    const { to, subject, type, name, eventTitle, eventDate, amount, tickets } = await request.json()

    if (!to || !subject || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Verify Authentication (Only admins can send certain emails)
    if (type !== 'newsletter_subscribe' && type !== 'review_thankyou' && type !== 'host_confirmation') {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // 3. Generate HTML Content based on type
    let htmlContent = ''
    
    if (type === 'booking_confirmation') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #111513;">
          <p>Hi ${name || 'there'},</p>
          <p>Great news! Your booking for <strong>${eventTitle || 'our event'}</strong> has been confirmed.</p>
          ${eventDate ? `<p><strong>Date:</strong> ${eventDate}</p>` : ''}
          ${tickets ? `<p><strong>Tickets:</strong> ${tickets}</p>` : ''}
          ${amount ? `<p><strong>Total Amount:</strong> ${amount}</p>` : ''}
          <p>We are so excited to see you there. If you have any questions, just reply to this email!</p>
          <br/>
          <p>Best regards,<br/>The YogaJam Team</p>
        </div>
      `
    } else if (type === 'host_confirmation') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #111513;">
          <p>Hi ${name || 'there'},</p>
          <p>We've received your personalized host request and we're thrilled you want to collaborate with us!</p>
          <p>We are currently reviewing your details and will follow up shortly to discuss the next steps.</p>
          <br/>
          <p>Best regards,<br/>The YogaJam Team</p>
        </div>
      `
    } else if (type === 'newsletter_subscribe') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #111513;">
          <p>Hi ${name || 'there'},</p>
          <p>You're on the list! We'll be in touch with the latest updates and exclusive events from YogaJam.</p>
          <br/>
          <p>Best regards,<br/>The YogaJam Team</p>
        </div>
      `
    } else if (type === 'booking_rejected') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #111513;">
          <p>Hi ${name || 'there'},</p>
          <p>We received your booking request for <strong>${eventTitle || 'our event'}</strong> (${tickets ? `${tickets} ticket(s)` : ''}${amount ? ` for ${amount}` : ''}), but unfortunately, we were unable to verify your payment.</p>
          <p>This could be due to an unclear screenshot, an incorrect UTR number, or the payment not being reflected in our system.</p>
          <p>Please double-check your payment details and submit a new booking request, or reply directly to this email for assistance.</p>
          <br/>
          <p>Best regards,<br/>The YogaJam Team</p>
        </div>
      `
    } else if (type === 'review_thankyou') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #111513;">
          <p>Hi ${name || 'there'},</p>
          <p>Thank you so much for sharing your experience at YogaJam!</p>
          <p>Your feedback means the world to us and helps our community grow. We're thrilled that you could join us and hope to see you at another event soon.</p>
          <br/>
          <p>Best regards,<br/>The YogaJam Team</p>
        </div>
      `
    } else {
       return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    // 4. Send Email via Resend
    const { data, error } = await resend.emails.send({
      from: 'YogaJam <contact@yogajam.fit>',
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
