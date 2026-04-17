'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUsersAction() {
  const supabase = await createAdminClient()
  
  // Directly query the public.users table from the schema provided
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users from public.users:', error)
    return { success: false, error: error.message }
  }

  return { success: true, users: data }
}

export async function createUserAction(formData: FormData) {
  const supabase = await createAdminClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string

  if (!email || !password || !name || !role) {
    return { success: false, error: 'All fields are required.' }
  }

  // 1. Create Auth Identity
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  })

  if (authError) {
    console.error('Error creating auth user:', authError)
    return { success: false, error: authError.message }
  }

  if (authData.user) {
    // 2. Map to public.users using upsert to handle cases where a database trigger may have already auto-inserted the record with default values.
    const { error: dbError } = await supabase.from('users').upsert({
      id: authData.user.id,
      email: authData.user.email,
      name: name,
      role: role
    })
    if (dbError) {
       console.error('Error syncing role to public.users:', dbError)
    }
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deleteUserAction(formData: FormData) {
  const supabase = await createAdminClient()
  const id = formData.get('id') as string
  
  if (!id) return { success: false, error: 'User ID is required.' }

  // 1. Delete from the public.users table first to manage potential orphan records
  const { error: dbError } = await supabase.from('users').delete().eq('id', id)
  
  if (dbError) {
    console.error('Error deleting from public.users:', dbError)
    // We continue anyway to attempt auth deletion, or we could return early. 
    // Usually, if the DB record is gone, we still want the Auth account gone.
  }

  // 2. Delete from Auth Identity
  const { error: authError } = await supabase.auth.admin.deleteUser(id)

  if (authError) {
    console.error('Error deleting auth user:', authError)
    return { success: false, error: authError.message }
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}
