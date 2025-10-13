// import { createSupabaseServerClient } from '@/lib/supabase/server';

// type R = {
//   id: string;
//   name: string;
//   description: string | null;
//   daily_rate_credits: number;
//   main_image_url: string | null;
//   owner_id: string;
//   profiles: { username: string } | { username: string }[] | null;
// };

// export default async function ResourceDetails({ params }: { params: { id: string } }) {
//   const supabase = await createSupabaseServerClient();
//   const { data } = await supabase
//     .from('resources')
//     .select('id, name, description, daily_rate_credits, main_image_url, owner_id, profiles:owner_id(username)')
//     .eq('id', params.id)
//     .single();

//   const r = data as R | null;
//   if (!r) return <div className="rounded-xl border bg-white p-6">Resource not found.</div>;

//   const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;

//   return (
//     <div className="grid gap-8 md:grid-cols-[1fr_360px]">
//       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <img src={r.main_image_url ?? ''} className="mb-6 h-80 w-full rounded-lg object-cover" alt="" />
//         <h1 className="mb-2 text-3xl font-bold">{r.name}</h1>
//         <p className="mb-4 text-slate-700">{r.description}</p>
//         <div className="text-blue-700">{r.daily_rate_credits} credits/day</div>
//       </div>
//       <aside className="space-y-4">
//         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//           <div className="mb-4">
//             <div className="font-medium">{profile?.username ?? 'Owner'}</div>
//             <div className="text-xs text-slate-600">Available for exchange</div>
//           </div>
//           <button disabled className="w-full cursor-not-allowed rounded-full bg-slate-200 px-4 py-2 text-slate-600">
//             Request (coming in Phase 2)
//           </button>
//         </div>
//         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//           <h3 className="mb-3 font-semibold">Reviews & Ratings</h3>
//           <p className="text-sm text-slate-600">We’ll add reviews later.</p>
//         </div>
//       </aside>
//     </div>
//   );
// }

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createRequestAction } from '@/app/actions/requests';

type R = {
  id: string;
  name: string;
  description: string | null;
  daily_rate_credits: number;
  main_image_url: string | null;
  owner_id: string;
  profiles: { username: string } | { username: string }[] | null;
};

export default async function ResourceDetails({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('resources')
    .select('id, name, description, daily_rate_credits, main_image_url, owner_id, profiles:owner_id(username)')
    .eq('id', params.id)
    .single();

  const r = data as R | null;
  if (!r) return <div className="rounded-xl border bg-white p-6">Resource not found.</div>;
  const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <img src={r.main_image_url ?? ''} className="mb-6 h-80 w-full rounded-lg object-cover" alt="" />
        <h1 className="mb-2 text-3xl font-bold">{r.name}</h1>
        <p className="mb-4 text-slate-700">{r.description}</p>
        <div className="text-blue-700">{r.daily_rate_credits} credits/day</div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <div className="font-medium">{profile?.username ?? 'Owner'}</div>
            <div className="text-xs text-slate-600">Available for exchange</div>
          </div>
          <form action={createRequestAction} className="space-y-2">
            <input type="hidden" name="resourceId" value={r.id} />
            <input type="hidden" name="estimated" value={String(r.daily_rate_credits)} />
            <textarea name="note" className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Add a note (optional)" />
            <button className="w-full rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Request this Resource
            </button>
          </form>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 font-semibold">Reviews & Ratings</h3>
          <p className="text-sm text-slate-600">We’ll add reviews later.</p>
        </div>
      </aside>
    </div>
  );
}