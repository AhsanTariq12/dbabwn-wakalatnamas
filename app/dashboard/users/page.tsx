import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import UsersView from './UsersView'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Use Admin Client to bypass RLS for role fetching to ensure it never fails
  const { createAdminClient } = await import('@/utils/supabase/server')
  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase.from('users').select('role').eq('id', user.id).single()

  const role = profile?.role || user.user_metadata?.role

  if (role !== 'super_admin') {
    redirect('/dashboard')
  }

  return <UsersView />
}
