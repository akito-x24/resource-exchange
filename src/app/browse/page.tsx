// // 'use client';
// // import { useState } from 'react';
// // import { useAppStore } from '@/store/useAppStore';
// // import { ResourceCard } from '@/components/ResourceCard';
// // import { LendResourceModal } from '@/components/LendResourceModal';
// // import { Plus } from 'lucide-react';
// // import { Sidebar } from '@/components/Sidebar';

// // export default function BrowsePage() {
// //   const resources = useAppStore((s) => s.resources);
// //   const [q, setQ] = useState('');
// //   const [open, setOpen] = useState(false);
// //   const filtered = resources.filter((r) =>
// //     r.name.toLowerCase().includes(q.toLowerCase())
// //   );

// //   return (
// //     <>
// //       <div className="grid gap-6 md:grid-cols-[280px_1fr]">
// //         <Sidebar />
// //         <section>
// //           <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// //             <h1 className="text-2xl font-bold">Available Resources</h1>
// //             <div className="flex items-center gap-2">
// //               <input
// //                 value={q}
// //                 onChange={(e) => setQ(e.target.value)}
// //                 placeholder="Search..."
// //                 className="w-56 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
// //               />
// //               <select className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm">
// //                 <option>Relevance</option>
// //                 <option>Newest</option>
// //                 <option>Lowest price</option>
// //                 <option>Highest price</option>
// //               </select>
// //             </div>
// //           </div>

// //           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
// //             {filtered.map((r) => (
// //               <ResourceCard key={r.id} r={r} />
// //             ))}
// //           </div>
// //         </section>
// //       </div>

// //       <button
// //         onClick={() => setOpen(true)}
// //         className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
// //       >
// //         <Plus size={18} /> Lend Something
// //       </button>
// //       <LendResourceModal open={open} onOpenChange={setOpen} />
// //     </>
// //   );
// // }


// import { createSupabaseServerClient } from '@/lib/supabase/server';
// import { ResourceCard } from '@/components/ResourceCard';
// import { Sidebar } from '@/components/Sidebar';

// export default async function BrowsePage() {
//   const supabase = createSupabaseServerClient();
//   const { data } = await supabase
//     .from('resources')
//     .select('id, name, description, daily_rate_credits, main_image_url, owner_id, status, profiles:owner_id(username)')
//     .eq('status','active')
//     .order('created_at', { ascending: false });

//   const items = (data ?? []).map((r) => ({
//     id: r.id,
//     ownerId: r.owner_id,
//     ownerName: r.profiles?.username ?? 'User',
//     name: r.name,
//     description: r.description ?? '',
//     dailyRate: r.daily_rate_credits,
//     imageUrl: r.main_image_url ?? '',
//     status: (r.status as 'active' | 'paused') ?? 'active',
//   }));

//   return (
//     <div className="grid gap-6 md:grid-cols-[280px_1fr]">
//       <Sidebar />
//       <section>
//         <div className="mb-4 flex items-center justify-between">
//           <h1 className="text-2xl font-bold">Available Resources</h1>
//         </div>
//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           {items.map((r) => <ResourceCard key={r.id} r={r} />)}
//         </div>
//       </section>
//     </div>
//   );
// }


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
    .select('id, name, description, daily_rate_credits, main_image_url, owner_id, status, profiles:owner_id(username)')
    .eq('status','active')
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
      dailyRate: r.daily_rate_credits,
      imageUrl: r.main_image_url ?? '',
      status: (r.status as 'active' | 'paused') ?? 'active',
    };
  });

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <Sidebar />
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Available Resources</h1>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => <ResourceCard key={r.id} r={r} />)}
        </div>
      </section>
    </div>
  );
}