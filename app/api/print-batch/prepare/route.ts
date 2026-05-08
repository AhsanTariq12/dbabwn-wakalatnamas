import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/utils/supabase/server'

// STEP 1: Verify identity and RESERVE a pending batch in DB
// This ensures the print template can fetch serials by batch_code.
export async function POST(req: Request) {
  try {
    const supabaseAuth = await createClient()
    const supabaseAdmin = await createAdminClient()

    // 1. Authenticate
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { quantity, amount_paid, printer, password } = body

    if (!quantity || !amount_paid || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (quantity < 1 || quantity > 200) {
      return NextResponse.json({ error: 'Quantity must be between 1 and 200' }, { status: 400 })
    }

    // 2. Role Verification
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role === 'viewer') {
      return NextResponse.json({ error: 'Forbidden: Unauthorized role' }, { status: 403 })
    }

    // 3. Password Verification
    const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email!,
      password: password
    })
    if (authError) {
      return NextResponse.json({ error: 'Invalid printing password' }, { status: 401 })
    }

    // 3.5 Cleanup Dangling Pending Batches
    // If a previous print failed (e.g. disconnected printer) and the frontend timed out before sending a rollback,
    // the batch remains 'pending' and traps those serial numbers.
    // We must roll them back to ensure the serial sequence is not skipped.
    const { data: pendingBatches } = await supabaseAdmin
      .from('batches')
      .select('id')
      .eq('status', 'pending')

    if (pendingBatches && pendingBatches.length > 0) {
      for (const b of pendingBatches) {
        // Delete wakalat_namas first to prevent foreign key errors (if CASCADE is missing)
        await supabaseAdmin.from('wakalat_namas').delete().eq('batch_id', b.id)
        // Delete the pending batch
        await supabaseAdmin.from('batches').delete().eq('id', b.id)
      }
      console.log(`Rolled back ${pendingBatches.length} dangling pending batches.`)
    }

    // 4. Reserve a pending batch + serials atomically in DB (RPC)
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('create_print_batch', {
      p_user_id: user.id,
      p_quantity: quantity,
      p_amount_paid: amount_paid,
      p_printer_name: printer || 'Unknown',
    })

    if (rpcError) {
      console.error('Prepare RPC Error:', rpcError)
      throw new Error(rpcError.message)
    }

    if (!result?.success) {
      return NextResponse.json({ error: result?.error || 'Failed to prepare print batch' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      batchId: result.batch_id,
      batchCode: result.batch_code,
      serialStart: result.serial_start,
      serialEnd: result.serial_end,
    })

  } catch (error: any) {
    console.error('Prepare Batch Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
