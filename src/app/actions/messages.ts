'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function sendMessageAction(chatId: string, body: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const text = (body || '').trim();
  if (!text) return { error: 'Empty message' };

  const { error } = await supabase.from('messages').insert({
    chat_id: chatId,
    sender_id: user.id,
    body: text,
    kind: 'text',
  });

  if (error) return { error: error.message };
  return { ok: true };
}
