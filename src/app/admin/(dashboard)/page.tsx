import { createClient } from '@/utils/supabase/server'
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient'

export const metadata = {
  title: 'Admin Dashboard | YogaJam',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  return (
    <AdminDashboardClient userEmail={user?.email || ''} />
  )
}
