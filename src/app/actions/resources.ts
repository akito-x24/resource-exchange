// 'use server';
// import { revalidatePath } from 'next/cache';
// import { createSupabaseServerClient } from '@/lib/supabase/server';

// export async function createResourceAction(fd: FormData) {
//   const supabase = createSupabaseServerClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) return { error: 'Not authenticated' };

//   const name = String(fd.get('name') || '').trim();
//   const description = String(fd.get('description') || '');
//   const dailyRate = Number(fd.get('dailyRate') || 0);
//   let main_image_url = String(fd.get('imageUrl') || '');

//   // You can add file upload later. For now we support URL only in Phase 1.
//   if (!name || Number.isNaN(dailyRate)) return { error: 'Invalid fields' };

//   const { error } = await supabase.from('resources').insert({
//     owner_id: user.id,
//     name,
//     description,
//     daily_rate_credits: dailyRate,
//     main_image_url,
//     status: 'active',
//   });

//   if (error) return { error: error.message };

//   revalidatePath('/browse');
//   revalidatePath('/resources');
//   return { ok: true };
// }

'use server';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function createResourceAction(fd: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const name = String(fd.get('name') || '').trim();
  const description = String(fd.get('description') || '');
  const dailyRate = Number(fd.get('dailyRate') || 0);
  let main_image_url = String(fd.get('imageUrl') || '');

  if (!name || Number.isNaN(dailyRate)) return { error: 'Invalid fields' };

  const { error } = await supabase.from('resources').insert({
    owner_id: user.id,
    name,
    description,
    daily_rate_credits: dailyRate,
    main_image_url,
    status: 'active',
  });

  if (error) return { error: error.message };

  revalidatePath('/browse');
  revalidatePath('/resources');
  return { ok: true };
}