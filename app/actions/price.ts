'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'

// Fetch the current price from the global settings table
export async function getWakalatPriceAction() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Unauthorized' }

    // Use admin client here instead to guarantee reading the settings
    // regardless of row level security configurations while testing.
    const supabaseAdmin = await createAdminClient()
    
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'wakalat_price')
      .maybeSingle()

    if (error) {
      console.error(error)
      return { success: false, error: error.message }
    }

    return { success: true, price: data?.value || 100 }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Securely update the global price setting
export async function setWakalatPriceAction(newPrice: number, password: string) {
  try {
    const supabaseAdmin = await createAdminClient()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Role Verification
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return { success: false, error: 'Forbidden: Only SuperAdmins can change the price.' }
    }

    if (!newPrice || newPrice <= 0) {
      return { success: false, error: 'Price must be greater than 0.' }
    }

    // Password Verification via Admin Client to protect the active session from unhandled errors
    const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email!, // Email exists since we successfully retrieved the user
      password: password
    })

    if (authError) {
      return { success: false, error: 'Invalid superadmin password.' }
    }

    // Upsert the new price globally into app_settings
    const { error: upsertError } = await supabaseAdmin
      .from('app_settings')
      .upsert({
         key: 'wakalat_price',
         value: newPrice,
         updated_at: new Date().toISOString(),
         updated_by: user.id
      }, { onConflict: 'key' })

    if (upsertError) {
      return { success: false, error: upsertError.message }
    }

    return { success: true, message: `Global Price securely updated to ${newPrice} Rs.` }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
