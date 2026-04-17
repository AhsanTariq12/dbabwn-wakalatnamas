import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PrintView from './PrintView'

export default async function PrintBatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the role to ensure viewers cannot access this page using Admin client for reliable access
  const { createAdminClient } = await import('@/utils/supabase/server')
  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase.from('users').select('role').eq('id', user.id).single()

  const role = profile?.role || user.user_metadata?.role

  if (!role || role === 'viewer') {
    redirect('/dashboard')
  }

  return <PrintView />
}
