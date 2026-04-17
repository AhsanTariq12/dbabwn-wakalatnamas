'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Verifies the password of the currently logged-in user.
 * This is used for "Presence Verification" before sensitive actions like printing.
 */
export async function verifyPasswordAction(password: string) {
  const supabase = await createClient()
  
  // 1. Get current user's email
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return { success: false, error: 'Authentication required.' }
  }

  // 2. Attempt to sign in again with the provided password
  // (In Supabase, this is the most reliable way to verify the current password)
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password,
  })

  if (error) {
    return { success: false, error: 'Incorrect password. Access denied.' }
  }

  return { success: true }
}
