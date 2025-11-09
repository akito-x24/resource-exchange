// import { NextResponse } from 'next/server';
// import { createSupabaseServerClient } from '@/lib/supabase/server';

// export async function POST(req: Request) {
//   try {
//     const { requestId } = await req.json();
//     const supabase = await createSupabaseServerClient();

//     // 1️⃣ Fetch request info
//     const { data: reqData, error: reqErr } = await supabase
//       .from('requests')
//       .select('id, borrower_id, total_estimated_credits, status')
//       .eq('id', requestId)
//       .single();

//     if (reqErr || !reqData) throw reqErr || new Error('Request not found');

//     // Only allow cancel if not completed
//     if (reqData.status === 'completed')
//       throw new Error('Cannot cancel a completed request');

//     const borrowerId = reqData.borrower_id;
//     const locked = reqData.total_estimated_credits ?? 0;

//     // 2️⃣ Unlock credits for borrower
//     const { error: walletErr } = await supabase.rpc('unlock_credits', {
//       borrower_id: borrowerId,
//       credit_amount: locked,
//     });

//     if (walletErr) throw walletErr;

//     // 3️⃣ Update request status
//     const { error: updateErr } = await supabase
//       .from('requests')
//       .update({ status: 'canceled' }) // ✅ single 'l'
//       .eq('id', requestId);

//     if (updateErr) throw updateErr;

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error('❌ Cancel request failed:', err.message);
//     return NextResponse.json({ success: false, error: err.message });
//   }
// }


// src/app/api/requests/cancel/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestId = String(body.requestId || '');

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId required' }, { status: 400 });
    }

    // create server supabase client with headers so auth is present
    const supabase = await createSupabaseServerClient(await headers());

    // fetch request details
    const { data: reqRow, error: reqErr } = await supabase
      .from('requests')
      .select('id, borrower_id, total_estimated_credits, status')
      .eq('id', requestId)
      .single();

    if (reqErr || !reqRow) {
      console.error('Request fetch error:', reqErr);
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // prevent cancelling completed
    if (reqRow.status === 'completed') {
      return NextResponse.json({ success: false, error: 'Cannot cancel a completed request' }, { status: 400 });
    }

    const borrowerId = reqRow.borrower_id as string;
    const amount = Number(reqRow.total_estimated_credits || 0);

    // call SQL function to unlock
    const { error: unlockErr } = await supabase.rpc('unlock_credits', {
      p_borrower_id: borrowerId,
      p_credit_amount: amount,
    });

    if (unlockErr) {
      console.error('unlock_credits error:', unlockErr);
      return NextResponse.json({ success: false, error: unlockErr.message }, { status: 500 });
    }

    // update request status - use the enum label that exists in your DB (likely 'canceled')
    const { error: updErr } = await supabase
      .from('requests')
      .update({ status: 'canceled' })
      .eq('id', requestId);

    if (updErr) {
      console.error('update request error:', updErr);
      return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Cancel API error:', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
