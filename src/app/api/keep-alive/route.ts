import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route serves as a cron endpoint to ping Supabase and keep the free tier project from pausing.
export async function GET() {
  try {
    // We use the basic supabase-js client here because we don't need user cookies or auth context for a simple ping
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Fetch 1 item from a commonly used table to register database activity
    const { error } = await supabase.from('gallery').select('id').limit(1);

    if (error) {
      console.error('Supabase keep-alive ping error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase pinged successfully to prevent auto-pausing.',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Supabase keep-alive unexpected error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
