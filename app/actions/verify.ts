'use server'

import { createAdminClient } from '@/utils/supabase/server'

export async function verifyWakalatNamaAction(serialStringRaw: string) {
  try {
    if (!serialStringRaw) return { valid: false, error: 'No serial number provided' }

    const serialString = serialStringRaw.trim()

    // Use admin client so public users don't need to be authenticated
    const supabaseAdmin = await createAdminClient()


    // Extract the trailing digits to match against the batch integer boundaries
    const match = serialString.match(/\d+$/)
    if (!match) {
      return { valid: false, error: 'Invalid serial format' }
    }
    const serialNum = parseInt(match[0], 10)

    // Find the batch that includes this serial number and was successfully printed
    const { data: batch, error } = await supabaseAdmin
      .from('batches')
      .select('id, batch_code, created_at, printer_name, quantity, amount_paid, serial_start, serial_end')
      .eq('status', 'printed')
      .lte('serial_start', serialNum)
      .gte('serial_end', serialNum)
      .maybeSingle()

    if (error) {
      console.error('Verify error:', error)
      return { valid: false, error: 'Database verification failed' }
    }

    if (!batch) {
      return { valid: false, error: 'This serial number is NOT registered in the official ledger.' }
    }

    // Now verify the exact wakalat nama exists in the wakalat_namas table,
    // just to be 100% strictly secure, matching the exact string to prevent spoofing ranges.
    const { data: form, error: formError } = await supabaseAdmin
      .from('wakalat_namas')
      .select('amount')
      .eq('serial_number', serialString)
      .limit(1)
      .maybeSingle()

    if (formError) {
      console.error('Form fetch error:', formError)
      return { valid: false, error: 'Database error while verifying exact form: ' + formError.message }
    }

    if (!form) {
      return { valid: false, error: 'The serial number falls within a valid batch range, but the exact string does not match the ledger.' }
    }


    return {
      valid: true,
      batch_code: batch.batch_code,
      created_at: batch.created_at,
      printer_name: batch.printer_name,
      amount: form.amount
    }

  } catch (error: any) {
    return { valid: false, error: error.message }
  }
}
