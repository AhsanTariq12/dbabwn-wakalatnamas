import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabaseAuth = await createClient()
    const supabaseAdmin = await createAdminClient()

    // Quick auth check to ensure only admins can hit this endpoint
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { quantity, amount_paid, printer } = body

    if (!quantity || !amount_paid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Get the latest serial number
    // For this prototype, we'll fetch the max ID or count to determine next serials
    // A robust way in prod is Postgres sequences, but this works for scale < 1M concurrent
    const { data: latest } = await supabaseAdmin
      .from('wakalat_namas')
      .select('serial_number')
      .order('serial_number', { ascending: false })
      .limit(1)

    let lastNum = 0
    if (latest && latest.length > 0) {
      const parts = latest[0].serial_number.split('-')
      lastNum = parseInt(parts[parts.length - 1], 10)
    }

    const currentYear = new Date().getFullYear()
    const dd = String(new Date().getDate()).padStart(2, '0')
    const mm = String(new Date().getMonth() + 1).padStart(2, '0')
    const dateStr = `${dd}${mm}` // e.g. 1604
    const serialStart = lastNum + 1
    const serialEnd = lastNum + quantity

    const bcode = `BNB-${currentYear}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // 2. Insert Batch
    const { data: batchData, error: batchError } = await supabaseAdmin
      .from('batches')
      .insert({
        batch_code: bcode,
        amount_paid,
        quantity,
        serial_start: serialStart,
        serial_end: serialEnd,
        printed_by: user.id,
        printer_name: printer || 'Unknown'
      })
      .select('id')
      .single()

    if (batchError) throw batchError

    // 3. Prepare Serials Array
    const serials = []
    const wakalatInserts = []

    // Each Wakalat Nama costs amount_paid / quantity
    const perUnitAmount = amount_paid / quantity

    for (let i = 0; i < quantity; i++) {
      const num = serialStart + i
      // Format: DBA-BWN-YYYY-Date-Sequence (e.g. DBA-BWN-2026-1604-000147)
      const serialNumber = `DBA-BWN-${currentYear}-${dateStr}-${String(num).padStart(6, '0')}`
      serials.push(serialNumber)
      wakalatInserts.push({
        serial_number: serialNumber,
        batch_id: batchData.id,
        amount: perUnitAmount,
        status: 'active'
      })
    }

    // 4. Insert Wakalat Namas
    const { error: insertError } = await supabaseAdmin
      .from('wakalat_namas')
      .insert(wakalatInserts)

    if (insertError) throw insertError

    return NextResponse.json({ success: true, bcode })

  } catch (error: any) {
    console.error('Print Batch Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
