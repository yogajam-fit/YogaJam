import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/admin/login')
  }

  // Check if user is in admins table
  const { data: adminUser, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', user.email)
    .single()

  if (error || !adminUser) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=Not+authorized')
  }

  return (
    <>
      {children}
    </>
  )
}
