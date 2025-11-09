'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function createRequestAction(fd: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

  const resourceId = String(fd.get('resourceId') || '');
  const note = String(fd.get('note') || '');
  const estimated = Number(fd.get('estimated') || 0);

  const { data: resRow, error: resErr } = await supabase
    .from('resources')
    .select('owner_id, daily_rate_credits')
    .eq('id', resourceId)
    .single();
  if (resErr || !resRow) redirect(`/resource/${resourceId}?error=` + encodeURIComponent('Resource not found'));

  const lenderId = resRow.owner_id;
  const est = estimated || resRow.daily_rate_credits;

  const { error } = await supabase.from('requests').insert({
    resource_id: resourceId,
    borrower_id: user.id,
    lender_id: lenderId,
    note,
    total_estimated_credits: est,
    status: 'pending',
  });

  if (error) redirect(`/resource/${resourceId}?error=` + encodeURIComponent(error.message));

  revalidatePath('/chats');
  redirect('/chats');
}


// Added from CHATGPT



export async function rejectRequestAction(fd: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

  const requestId = String(fd.get('requestId') || '');
  const { error } = await supabase
    .from('requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('lender_id', user.id);

  if (error) redirect('/chats?error=' + encodeURIComponent(error.message));

  revalidatePath('/chats');
  redirect('/chats');
}


// Added from CHATGPT



export async function acceptRequestAction(fd: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

  const requestId = String(fd.get('requestId') || '');

  const { data, error } = await supabase.rpc('accept_with_escrow', {
    p_request_id: requestId,
    p_lender_id: user.id,
  });
 
  if (error) redirect('/chats?error=' + encodeURIComponent(error.message));

  revalidatePath('/chats');
  const chatId = (data as string | null) ?? '';
  redirect(`/chats/${chatId}`);
}

export async function completeRequestAction(fd: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

  const requestId = String(fd.get('requestId') || '');
  const { error } = await supabase.rpc('complete_with_release', {
    p_request_id: requestId,
    p_actor: user.id,
  });

  if (error) redirect(`/chats?error=` + encodeURIComponent(error.message));
  revalidatePath('/chats');
  redirect('/chats');
}

export async function cancelRequestAction(fd: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

  const requestId = String(fd.get('requestId') || '');
  const { error } = await supabase.rpc('cancel_with_refund', {
    p_request_id: requestId,
    p_actor: user.id,
  });

  if (error) redirect(`/chats?error=` + encodeURIComponent(error.message));
  revalidatePath('/chats');
  redirect('/chats');
}

export async function transferCreditsAction(fd: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

  const requestId = String(fd.get('requestId') || '');
  const to = String(fd.get('to') || '');
  const amount = Number(fd.get('amount') || 0);

  const { error } = await supabase.rpc('transfer_credits', {
    p_request_id: requestId,
    p_from: user.id,
    p_to: to,
    p_amount: amount,
  });

  if (error) redirect(`/chats?error=` + encodeURIComponent(error.message));
  revalidatePath(`/chats`);
}

// 'use server';

// import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation';
// import { createSupabaseServerClient } from '@/lib/supabase/server';

// /* ------------------- CREATE REQUEST ------------------- */
// export async function createRequestAction(fd: FormData): Promise<void> {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

//   const resourceId = String(fd.get('resourceId') || '');
//   const note = String(fd.get('note') || '');
//   const estimated = Number(fd.get('estimated') || 0);

//   const { data: resRow, error: resErr } = await supabase
//     .from('resources')
//     .select('owner_id, daily_rate_credits')
//     .eq('id', resourceId)
//     .single();

//   if (resErr || !resRow)
//     redirect(
//       `/resource/${resourceId}?error=` +
//         encodeURIComponent('Resource not found')
//     );

//   const lenderId = resRow.owner_id;
//   const est = estimated || resRow.daily_rate_credits;

//   const { error } = await supabase.from('requests').insert({
//     resource_id: resourceId,
//     borrower_id: user.id,
//     lender_id: lenderId,
//     note,
//     total_estimated_credits: est,
//     status: 'pending',
//   });

//   if (error)
//     redirect(
//       `/resource/${resourceId}?error=` + encodeURIComponent(error.message)
//     );

//   revalidatePath('/chats');
//   redirect('/chats');
// }

// /* ------------------- REJECT REQUEST ------------------- */
// export async function rejectRequestAction(fd: FormData): Promise<void> {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

//   const requestId = String(fd.get('requestId') || '');
//   const { error } = await supabase
//     .from('requests')
//     .update({ status: 'rejected' })
//     .eq('id', requestId)
//     .eq('lender_id', user.id);

//   if (error) redirect('/chats?error=' + encodeURIComponent(error.message));

//   revalidatePath('/chats');
//   redirect('/chats');
// }

// /* ------------------- ACCEPT REQUEST ------------------- */
// export async function acceptRequestAction(fd: FormData): Promise<void> {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     redirect('/login?error=' + encodeURIComponent('Please log in'));
//   }

//   const requestId = String(fd.get('requestId') || '');
//   if (!requestId) {
//     redirect('/chats?error=' + encodeURIComponent('Invalid request ID'));
//   }

//   // Call Supabase RPC (creates chat + escrow)
//   const { data, error } = await supabase.rpc('accept_with_escrow', {
//     p_request_id: requestId,
//     p_lender_id: user.id,
//   });

//   if (error) {
//     console.error('RPC Error:', error);
//     redirect('/chats?error=' + encodeURIComponent(error.message));
//   }

//   const chatId = data as string | null;
//   if (!chatId) {
//     redirect('/chats?error=' + encodeURIComponent('Chat creation failed.'));
//   }

//   revalidatePath('/chats');
//   revalidatePath(`/chats/${chatId}`);
//   redirect(`/chats/${chatId}`);
// }

// /* ------------------- COMPLETE REQUEST ------------------- */
// export async function completeRequestAction(fd: FormData): Promise<void> {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

//   const requestId = String(fd.get('requestId') || '');
//   const { error } = await supabase.rpc('complete_with_release', {
//     p_request_id: requestId,
//     p_actor: user.id,
//   });

//   if (error)
//     redirect(`/chats?error=` + encodeURIComponent(error.message));

//   revalidatePath('/chats');
//   redirect('/chats');
// }

// /* ------------------- CANCEL REQUEST ------------------- */
// export async function cancelRequestAction(fd: FormData): Promise<void> {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

//   const requestId = String(fd.get('requestId') || '');
//   const { error } = await supabase.rpc('cancel_with_refund', {
//     p_request_id: requestId,
//     p_actor: user.id,
//   });

//   if (error)
//     redirect(`/chats?error=` + encodeURIComponent(error.message));

//   revalidatePath('/chats');
//   redirect('/chats');
// }

// /* ------------------- TRANSFER CREDITS ------------------- */
// export async function transferCreditsAction(fd: FormData): Promise<void> {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

//   const requestId = String(fd.get('requestId') || '');
//   const to = String(fd.get('to') || '');
//   const amount = Number(fd.get('amount') || 0);

//   const { error } = await supabase.rpc('transfer_credits', {
//     p_request_id: requestId,
//     p_from: user.id,
//     p_to: to,
//     p_amount: amount,
//   });

//   if (error)
//     redirect(`/chats?error=` + encodeURIComponent(error.message));

//   revalidatePath(`/chats`);
// }
