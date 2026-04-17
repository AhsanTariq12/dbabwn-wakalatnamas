import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabaseAuth = await createClient()
    const supabaseAdmin = await createAdminClient()

    // 1. Auth check
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { batchId, action } = await req.json()

    if (!batchId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (action === 'confirm') {
      // Finalize the batch (set status to 'printed')
      const { error } = await supabaseAdmin.rpc('finalize_print_batch', { 
        p_batch_id: batchId
      })
      if (error) {
        console.error('Finalize RPC Error:', error)
        throw error
      }
      return NextResponse.json({ success: true, message: 'Batch finalized' })
    } 
    
    if (action === 'rollback') {
      // Delete the pending batch and serials
      const { error } = await supabaseAdmin.rpc('rollback_print_batch', { 
        p_batch_id: batchId
      })
      if (error) {
        console.error('Rollback RPC Error:', error)
        throw error
      }
      return NextResponse.json({ success: true, message: 'Batch rolled back and serials released' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Batch Confirm Error:', error)
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 })
  }
}
