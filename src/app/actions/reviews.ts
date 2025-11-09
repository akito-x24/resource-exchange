'use server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReviewAction(formData: FormData) {
  const rating = Number(formData.get('rating'));
  const comment = formData.get('comment')?.toString()?.trim() || '';
  const resourceId = formData.get('resourceId')?.toString();
  const requestId = formData.get('requestId')?.toString();
  const revieweeId = formData.get('revieweeId')?.toString();

  if (!rating || !resourceId || !requestId || !revieweeId)
    return { error: 'Missing required fields.' };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated.' };

  const { error } = await supabase.from('reviews').insert({
    resource_id: resourceId,
    request_id: requestId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating,
    comment,
  });

  if (error) {
    console.error('❌ Review insert failed:', error.message);
    return { error: error.message };
  }

  revalidatePath(`/resources/${resourceId}`);
  return { success: true };
}
