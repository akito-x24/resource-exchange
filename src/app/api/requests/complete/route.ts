// import { NextResponse } from 'next/server';
// import { createSupabaseServerClient } from '@/lib/supabase/server';

// export async function POST(req: Request) {
//   try {
//     const supabase = await createSupabaseServerClient();
//     const body = await req.json();
//     const { requestId } = body;

//     if (!requestId) {
//       return NextResponse.json({ success: false, error: 'Missing request ID' }, { status: 400 });
//     }

//     // Update status in Supabase
//     const { error } = await supabase
//       .from('requests')
//       .update({ status: 'completed' })
//       .eq('id', requestId);

//     if (error) throw error;

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error('❌ Complete request error:', error.message);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { requestId } = await req.json();

    if (!requestId)
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

    const supabase = await createSupabaseServerClient();

    // ✅ Mark as completed
    const { error } = await supabase
      .from('requests')
      .update({ status: 'completed' })
      .eq('id', requestId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Complete request error:', err.message);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
