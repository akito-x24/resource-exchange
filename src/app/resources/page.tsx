'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { LendResourceModal } from '@/components/LendResourceModal';

export default function MyResourcesPage() {
  const supabase = createSupabaseBrowserClient();
  const [resources, setResources] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('resources')
          .select('id, name, description, daily_rate_credits, main_image_url')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) console.error('Error fetching resources:', error);
        setResources(data ?? []);
      } catch (err) {
        console.error('Error loading resources:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]); // Refresh when new item added

  // 🧠 1️⃣ Handle "not logged in" before "loading"
  if (!loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 px-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Please log in
          </h2>
          <p className="text-slate-600 text-sm">
            You need to be signed in to manage your resources.
          </p>
        </div>
      </div>
    );
  }

  // 🧠 2️⃣ Show loading state only while fetching (and user exists)
  if (loading) {
    return (
      <div className="mx-4 px-8 py-10">
        <span className="text-3xl font-extrabold mb-6">Your Items</span>
        <div className="text-slate-600 pt-8">Loading your resources...</div>
      </div>
    );
  }

  // 🧠 3️⃣ Actual content
  return (
    <div className="mx-4 px-8 py-10">
      <span className="text-3xl font-extrabold mb-6 block">Your Items</span>

      {resources.length === 0 ? (
        <div className="text-slate-600 pt-8">
          No resources yet. Use <strong>“Lend Something”</strong> to share your items.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 transition-all animate-fadeIn">
          {resources.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              {r.main_image_url ? (
                <img
                  src={r.main_image_url}
                  alt={r.name}
                  className="h-40 w-full object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="h-40 w-full flex items-center justify-center bg-slate-100 text-slate-400 rounded-lg mb-3">
                  No Image
                </div>
              )}
              <h3 className="font-semibold text-slate-800">{r.name}</h3>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {r.description}
              </p>
              <p className="text-sm text-blue-600 font-medium mt-2">
                {r.daily_rate_credits} credits
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Floating Lend Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-3 shadow-2xl hover:bg-blue-700 transition"
      >
        + Lend Something
      </button>

      <LendResourceModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
