'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';

type ChatRow = { request_id: string };
type RequestRow = { borrower_id: string; lender_id: string };

export async function sendMessageAction(chatId: string, body: string, imageFile?: File) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check chat and request
  const { data: chatRow, error: chatErr } = await supabase
    .from('chats')
    .select('request_id')
    .eq('id', chatId)
    .single<ChatRow>();

  if (chatErr || !chatRow) return { error: 'Chat not found' };

  const { data: reqRow, error: reqErr } = await supabase
    .from('requests')
    .select('borrower_id, lender_id')
    .eq('id', chatRow.request_id)
    .single<RequestRow>();

  if (reqErr || !reqRow) return { error: 'Request not found' };

  if (user.id !== reqRow.borrower_id && user.id !== reqRow.lender_id) {
    return { error: 'Not authorized to post in this chat' };
  }

  let imageUrl: string | null = null;

  // 📎 If there's an image file, upload it to Supabase Storage
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const filePath = `chat-${chatId}/${randomUUID()}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from('chat-images')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
      });

    if (uploadErr) {
      console.error('Upload error:', uploadErr);
      return { error: 'Failed to upload image.' };
    }

    const { data: urlData } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath);

    imageUrl = urlData?.publicUrl || null;
  }

  // 📨 Insert message
  const text = (body ?? '').trim();

  if (!text && !imageUrl) return { error: 'Empty message.' };

  const { error: insertErr } = await supabase.from('messages').insert({
    chat_id: chatId,
    sender_id: user.id,
    body: text || null,
    kind: imageUrl ? 'image' : 'text',
    image_url: imageUrl,
  });

  if (insertErr) return { error: insertErr.message };

  return { ok: true };
}
