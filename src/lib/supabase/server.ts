import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // Next 15 types expect await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // RSC is read-only for cookies; only Server Actions can set.
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignore in Server Components; allowed in Server Actions/Routes
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // ignore in RSC
          }
        },
      },
    }
  );
}