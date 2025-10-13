// // 'use client';
// // import { useAppStore } from '@/store/useAppStore';
// // import Link from 'next/link';                                                -- THIS IS NOT IN NEW CODE BELOW 

// // export default function MyResourcesPage() {
// //   const me = useAppStore(s => s.me);
// //   const resources = useAppStore(s => s.resources.filter(r => r.ownerId === me.id));

// //   return (
// //     <div>
// //       <h1 className="mb-4 text-2xl font-bold">My Resources</h1>
// //       <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
// //         {resources.map(r => (
// //           <div key={r.id} className="rounded-xl border bg-white">
// //             <img src={r.imageUrl} className="h-40 w-full rounded-t-xl object-cover" alt="" />
// //             <div className="p-4">
// //               <div className="font-semibold">{r.name}</div>
// //               <div className="text-sm text-gray-600">{r.dailyRate} credits/day</div>
// //               <div className="mt-3">
// //                 <Link className="text-blue-600 underline" href={`/resource/${r.id}`}>View</Link>
// //               </div>
// //             </div>
// //           </div>
// //         ))}
// //         {resources.length === 0 && <div className="rounded-md border bg-white p-6 text-gray-600">No resources yet. Use the “Lend Something” button.</div>}
// //       </div>
// //     </div>
// //   );
// // }


// 'use client';
// import { useAppStore } from '@/store/useAppStore';

// export default function MyResourcesPage() {
//   const me = useAppStore((s) => s.me);
//   const resources = useAppStore((s) => s.resources);

//   const myResources = resources.filter((r) => r.ownerId === me.id);

//   return (
//     <div>
//       <h1 className="mb-4 text-2xl font-bold">My Resources</h1>
//       <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//         {myResources.map((r) => (
//           <a key={r.id} href={`/resource/${r.id}`} className="rounded-2xl border bg-white">
//             <img src={r.imageUrl} className="h-40 w-full rounded-t-2xl object-cover" alt="" />
//             <div className="p-4">
//               <div className="font-semibold">{r.name}</div>
//               <div className="text-sm text-slate-600">{r.dailyRate} credits/day</div>
//             </div>
//           </a>
//         ))}
//         {myResources.length === 0 && (
//           <div className="rounded-xl border bg-white p-6 text-slate-600">
//             No resources yet. Use “Lend Something”.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function MyResourcesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="rounded-xl border bg-white p-6">Please log in.</div>;

  const { data } = await supabase
    .from('resources')
    .select('id, name, daily_rate_credits, main_image_url')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">My Resources</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((r) => (
          <a key={r.id} href={`/resource/${r.id}`} className="rounded-2xl border bg-white">
            <img src={r.main_image_url ?? ''} className="h-40 w-full rounded-t-2xl object-cover" alt="" />
            <div className="p-4">
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-slate-600">{r.daily_rate_credits} credits/day</div>
            </div>
          </a>
        ))}
        {(data ?? []).length === 0 && (
          <div className="rounded-xl border bg-white p-6 text-slate-600">No resources yet. Use “Lend Something”.</div>
        )}
      </div>
    </div>
  );
}