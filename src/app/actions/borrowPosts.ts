'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/* ----------------------------------------------------
   🗑️ DELETE BORROW POST
---------------------------------------------------- */
export async function deleteBorrowPostAction(formData: FormData) {
  const id = formData.get('postId')?.toString();
  if (!id) return { error: 'Invalid post ID.' };

  // ✅ use headers() to include session cookies
const supabase = await createSupabaseServerClient(await headers());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated.' };

  console.log('🗑 Attempting to delete post:', id, 'by user:', user.id);

  const { error } = await supabase
    .from('borrow_posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('❌ Delete error:', error);
    return { error: 'Failed to delete post.' };
  }

  console.log('✅ Post deleted successfully');
revalidatePath('/Requests');
revalidatePath('/browse');
  return { success: true };
}

/* ----------------------------------------------------
   💬 ACCEPT BORROW OFFER → CREATE REQUEST + OPEN CHAT
---------------------------------------------------- */
export async function acceptBorrowPostAction(formData: FormData) {
  const postId = formData.get('postId')?.toString();
  const borrowerId = formData.get('borrowerId')?.toString();
  const offeredCredits = Number(formData.get('offeredCredits'));

  if (!postId || !borrowerId || isNaN(offeredCredits)) {
    return { error: 'Invalid borrow post data.' };
  }

  // ✅ use headers() to pass cookies/session to Supabase
const supabase = await createSupabaseServerClient(await headers());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?error=' + encodeURIComponent('Please log in'));

  console.log('📤 Creating new request:', {
    postId,
    borrowerId,
    lender: user.id,
    offeredCredits,
  });

  // 1️⃣ Create new request record
  const { data: reqData, error: reqError } = await supabase
    .from('requests')
    .insert({
      borrower_id: borrowerId,
      lender_id: user.id,
      total_estimated_credits: offeredCredits,
      status: 'pending',
      resource_id: null, // now allowed after altering schema
    })
    .select('id')
    .single();

  if (reqError || !reqData) {
    console.error('❌ Request creation failed:', reqError);
    redirect(
      '/Requests?error=' +
        encodeURIComponent(reqError?.message || 'Failed to accept offer.')
    );
  }

  const requestId = reqData.id;
  console.log('✅ Request created:', requestId);

  // 2️⃣ Call our accept_with_escrow RPC (creates escrow + chat)
  const { data: chatData, error: rpcError } = await supabase.rpc(
    'accept_with_escrow',
    {
      p_request_id: requestId,
      p_lender_id: user.id,
    }
  );

  if (rpcError) {
    console.error('❌ RPC error:', rpcError);
    redirect(
      '/Requests?error=' +
        encodeURIComponent(rpcError?.message || 'Escrow failed.')
    );
  }

  const chatId = chatData as string | null;
  if (!chatId) {
    redirect('/Requests?error=' + encodeURIComponent('Chat creation failed.'));
  }

  console.log('✅ Chat created via RPC:', chatId);

  // 3️⃣ Revalidate + redirect to chat
  revalidatePath('/Requests');
  revalidatePath(`/chats/${chatId}`);
  redirect(`/chats/${chatId}`);
}

/* ----------------------------------------------------
   ✍️ CREATE BORROW POST
---------------------------------------------------- */
export async function createBorrowPostAction(formData: FormData) {
const supabase = await createSupabaseServerClient(await headers());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to post a request.' };
  }

  const title = formData.get('title')?.toString().trim() || '';
  const description = formData.get('description')?.toString().trim() || '';
  const offered_credits = Number(formData.get('offered_credits'));

  if (!title || isNaN(offered_credits)) {
    return { error: 'Title and offered credits are required.' };
  }

  const { error } = await supabase.from('borrow_posts').insert({
    user_id: user.id,
    title,
    description,
    offered_credits,
  });

  if (error) {
    console.error('Insert error:', error.message);
    return { error: 'Failed to create borrow request.' };
  }

  revalidatePath('/Requests');
  return { success: true };
}
