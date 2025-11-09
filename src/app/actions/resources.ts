'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function createResourceAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  // ✅ Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // ✅ Extract fields safely
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '');
  const daily_rate_credits = Number(formData.get('daily_rate_credits') || 0);
  const main_image_url = String(formData.get('main_image_url') || '').trim();

  if (!name || Number.isNaN(daily_rate_credits)) {
    return { error: 'Please fill in all required fields correctly.' };
  }

  // ✅ Insert new resource into database
  const { error } = await supabase.from('resources').insert({
    owner_id: user.id,
    name,
    description,
    daily_rate_credits,
    main_image_url: main_image_url || null, // use null if empty
    status: 'active',
  });

  if (error) {
    console.error('Supabase insert error:', error.message);
    return { error: error.message };
  }

  // ✅ Refresh resource lists
  revalidatePath('/browse');
  revalidatePath('/resources');
  return { ok: true };
}
