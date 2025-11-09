// import Link from 'next/link';
// import { createSupabaseServerClient } from '@/lib/supabase/server';

// type SidebarItem = {
//   id: string;
//   title: string;
//   href: string;
//   subtitle: string; // always present to avoid union issues
// };

// export async function Sidebar() {
//   const supabase = await createSupabaseServerClient();
//   const { data: { user } } = await supabase.auth.getUser();

//   if (!user) {
//     return (
//       <aside className="space-y-3">
//         <div className="rounded-2xl border border-slate-200 bg-white p-4">
//           <h2 className="mb-3 text-lg font-semibold">Chat & Requests</h2>
//           <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-600">
//             Sign in to see your chats and requests.
//           </div>
//         </div>
//       </aside>
//     );
//   }

//   // Pending requests for me
//   const { data: pendingRaw } = await supabase
//     .from('requests')
//     .select(`
//       id, resource_id, borrower_id, lender_id, total_estimated_credits, status,
//       resources(name),
//       borrower:profiles!requests_borrower_id_fkey(username, avatar_url)
//     `)
//     .eq('status', 'pending')
//     .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
//     .order('created_at', { ascending: false })
//     .limit(4);

//   const pending: SidebarItem[] = (pendingRaw ?? []).map((row: any) => {
//     const resource = Array.isArray(row.resources) ? row.resources[0] : row.resources;
//     const borrower = Array.isArray(row.borrower) ? row.borrower[0] : row.borrower;
//     return {
//       id: row.id as string,
//       title: borrower?.username ?? 'Borrower',
//       subtitle: `Pending • ${resource?.name ?? 'Resource'} • ${row.total_estimated_credits} cr`,
//       href: '/chats',
//     };
//   });

//   // Active chats (accepted requests with a chat)
//   const { data: acceptedReqs } = await supabase
//     .from('requests')
//     .select('id, borrower_id, lender_id, resources(name)')
//     .eq('status', 'accepted')
//     .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
//     .order('created_at', { ascending: false })
//     .limit(8);

//   const acceptedIds = (acceptedReqs ?? []).map((r) => r.id);

//   let chats: SidebarItem[] = [];
//   if (acceptedIds.length > 0) {
//     const { data: chatsRaw } = await supabase
//       .from('chats')
//       .select('id, request_id')
//       .in('request_id', acceptedIds);

//     chats = (chatsRaw ?? []).map((c) => {
//       const req = (acceptedReqs ?? []).find((r) => r.id === c.request_id)!;
//       const resource = Array.isArray(req.resources) ? req.resources[0] : (req as any).resources;
//       return {
//         id: c.id,
//         title: resource?.name ?? 'Chat',
//         subtitle: 'Active chat',
//         href: `/chats/${c.id}`,
//       };
//     });
//   }

//   const items: SidebarItem[] = [...chats, ...pending].slice(0, 6);

//   return (
//     <aside className="space-y-3">
//       <div className="rounded-2xl border border-slate-200 bg-white p-4">
//         <h2 className="mb-3 text-lg font-semibold">Active Chats</h2>
//         <div className="space-y-2">
//           {items.length === 0 ? (
//             <div className=" bg-slate-50 p-3 text-sm text-slate-600">
//               No active chats.
//             </div>
//           ) : (
//             items.map((it) => (
//               <Link key={it.id} href={it.href} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50">
//                 <div className="h-9 w-9 flex-shrink-0 rounded-full bg-slate-100 ring-1 ring-slate-200" />
//                 <div className="min-w-0">
//                   <div className="truncate text-sm font-medium">{it.title}</div>
//                   <div className="truncate text-xs text-slate-600">{it.subtitle}</div>
//                 </div>
//               </Link>
//             ))
//           )}
//         </div>
//       </div>
//     </aside>
//   );
// }







import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type SidebarItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  avatar?: string | null;
};

export async function Sidebar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <aside className="w-full">
        <div className=" bg-white p-5">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Active Chats
          </h2>
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            Please log in to see your chats.
          </div>
        </div>
      </aside>
    );
  }

  // Fetch accepted requests (active chats)
  const { data: acceptedReqs } = await supabase
    .from('requests')
    .select(`
      id, borrower_id, lender_id, status, resources(name),
      borrower:profiles!requests_borrower_id_fkey(username, avatar_url),
      lender:profiles!requests_lender_id_fkey(username, avatar_url)
    `)
    .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(8);

  const acceptedIds = (acceptedReqs ?? []).map((r) => r.id);

  let chats: SidebarItem[] = [];

  if (acceptedIds.length > 0) {
    const { data: chatsRaw } = await supabase
      .from('chats')
      .select('id, request_id')
      .in('request_id', acceptedIds);

    chats = (chatsRaw ?? []).map((c) => {
      const req = (acceptedReqs ?? []).find((r) => r.id === c.request_id);
      if (!req) return null;

      const resource = Array.isArray(req.resources)
        ? req.resources[0]
        : req.resources;

      // Fix: handle borrower/lender that may return arrays
      const borrower = Array.isArray(req.borrower)
        ? req.borrower[0]
        : req.borrower;
      const lender = Array.isArray(req.lender)
        ? req.lender[0]
        : req.lender;

      const otherUser =
        req.borrower_id === user.id ? lender : borrower;

      return {
        id: c.id,
        title: otherUser?.username ?? 'User',
        subtitle: `Chat about ${resource?.name ?? 'Resource'}`,
        href: `/chats/${c.id}`,
        avatar: otherUser?.avatar_url ?? null,
      };
    }).filter(Boolean) as SidebarItem[];
  }

  return (
    <aside className="w-full">
      <div className="rounded-xl border border-white bg-white p-2">
        <span className="mb-4 text-lg font-extrabold text-slate-800">
          Active Chats
        </span>
          <div className="mt-4 space-y-2">
  {chats.length === 0 ? (
    <div className="bg-slate-50 p-3 text-sm text-slate-600">
      No active chats.
    </div>
  ) : (
            chats.map((chat) => (
              <Link
                key={chat.id}
                href={chat.href}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition"
              >
                {chat.avatar ? (
                  <Image
                    src={chat.avatar}
                    alt={chat.title}
                    width={55}
                    height={55}
                    className="rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-medium">
                    {chat.title[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {chat.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {chat.subtitle}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
