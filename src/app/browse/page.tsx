import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ResourceCard } from '@/components/ResourceCard';
import { Sidebar } from '@/components/Sidebar';

type R = {
  id: string;
  name: string;
  description: string | null;
  daily_rate_credits: number;
  main_image_url: string | null;
  owner_id: string;
  status: string;
  profiles: { username: string } | { username: string }[] | null;
};

export default async function BrowsePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('resources')
    .select(
      'id, name, description, daily_rate_credits, main_image_url, owner_id, status, profiles:owner_id(username)'
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const rows = (data ?? []) as R[];
  const items = rows.map((r) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      ownerId: r.owner_id,
      ownerName: profile?.username ?? 'User',
      name: r.name,
      description: r.description ?? '',
      Rate: r.daily_rate_credits,
      imageUrl: r.main_image_url ?? '',
      status: (r.status as 'active' | 'paused') ?? 'active',
    };
  });

  return (
    <div className="flex h-[calc(99vh-64px)] w-full overflow-hidden">
      {/* LEFT: Sidebar */}
      <div className="w-[360px] border-r border-slate-200 h-full overflow-y-auto bg-white">
        <div className="p-6">
          <Sidebar />
        </div>
      </div>

      {/* DIVIDER (thin vertical line between sidebar and content) */}
      <div className="w-px bg-slate-200 h-full" />

      {/* RIGHT: Available Resources */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="px-10 py-8">
          {/* Heading */}
          <span className="text-2xl font-extrabold text-slate-900">
            Available Resources
          </span>

          {/* Space between heading and cards */}
          {items.length === 0 ? (
            <p className="mt-6 text-slate-600 text-sm">
              No resources available yet.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => (
                <ResourceCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
