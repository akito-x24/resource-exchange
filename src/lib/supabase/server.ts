import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Works with both sync & async cookies() / headers() (Next.js 14 → 15)
 * No TS errors with Supabase SSR types.
 */
export async function createSupabaseServerClient(customHeaders?: HeadersInit) {
  const cookieStore = await Promise.resolve(cookies());
  const headerStore = await Promise.resolve(customHeaders || headers());

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignored for read-only RSC contexts
          }
        },
        remove(name: string, options?: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // ignored for read-only RSC contexts
          }
        },
      },
    }
  );
}
