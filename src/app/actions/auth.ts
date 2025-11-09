'use server';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function signUpAction(fd: FormData): Promise<void> {
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const password = String(fd.get('password') || '').trim();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect('/login?error=' + encodeURIComponent(error.message));
  redirect('/browse');
}

export async function signInAction(fd: FormData): Promise<void> {
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const password = String(fd.get('password') || '').trim();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/login?error=' + encodeURIComponent(error.message));
  redirect('/browse');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}