'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Supabase typically returns a generic auth error for invalid credentials.
    // Show a user-friendly message without leaking which field is wrong.
    redirect('/login?error=Password%20is%20wrong%20or%20email%20not%20found')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
