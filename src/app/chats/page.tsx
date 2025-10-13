// // 'use client';
// // import { useRouter } from 'next/navigation';
// // import { useAppStore } from '@/store/useAppStore';
// // import { ChevronRight } from 'lucide-react';

// // export default function ChatsAndRequests() {
// //   const router = useRouter();
// //   const me = useAppStore((s) => s.me);
// //   const users = useAppStore((s) => s.users);
// //   const resources = useAppStore((s) => s.resources);
// //   const chats = useAppStore((s) => s.chats);
// //   const requests = useAppStore((s) => s.requests);
// //   const accept = useAppStore((s) => s.acceptRequest);
// //   const reject = useAppStore((s) => s.rejectRequest);

// //   const myChats = chats.filter((c) => c.participantIds.includes(me.id) && c.isOpen);
// //   const myPending = requests.filter(
// //     (r) => (r.lenderId === me.id || r.borrowerId === me.id) && r.status === 'pending'
// //   );

// //   function onAccept(reqId: string) {
// //     const chat = accept(reqId);
// //     router.push(`/chats/${chat.id}`);
// //   }

// //   return (
// //     <div className="grid gap-8 lg:grid-cols-2">
// //       <div>
// //         <h1 className="mb-4 text-2xl font-bold">Active Chats</h1>
// //         <div className="space-y-3">
// //           {myChats.map((c) => {
// //             const otherId = c.participantIds.find((id) => id !== me.id)!;
// //             const u = users[otherId];
// //             const req = requests.find((r) => r.id === c.requestId)!;
// //             const res = resources.find((r) => r.id === req.resourceId)!;
// //             return (
// //               <button
// //                 key={c.id}
// //                 onClick={() => router.push(`/chats/${c.id}`)}
// //                 className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
// //               >
// //                 <div className="flex items-center gap-3">
// //                   <img src={u.avatarUrl} className="h-10 w-10 rounded-full ring-1 ring-slate-200" alt="" />
// //                   <div>
// //                     <div className="font-medium">{u.name}</div>
// //                     <div className="text-sm text-slate-600">Discussing {res.name}</div>
// //                   </div>
// //                 </div>
// //                 <ChevronRight className="text-slate-400" />
// //               </button>
// //             );
// //           })}
// //           {myChats.length === 0 && (
// //             <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No chats yet.</div>
// //           )}
// //         </div>
// //       </div>

// //       <div>
// //         <h2 className="mb-4 text-2xl font-bold">Pending Requests</h2>
// //         <div className="space-y-3">
// //           {myPending.map((req) => {
// //             const res = resources.find((r) => r.id === req.resourceId)!;
// //             const borrower = users[req.borrowerId];
// //             return (
// //               <div key={req.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
// //                 <div>
// //                   <div className="font-medium">{borrower.name}</div>
// //                   <div className="text-sm text-slate-600">Request for {res.name}</div>
// //                 </div>
// //                 <div className="flex gap-2">
// //                   <button onClick={() => reject(req.id)} className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">Decline</button>
// //                   <button onClick={() => onAccept(req.id)} className="rounded-full bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Accept</button>
// //                 </div>
// //               </div>
// //             );
// //           })}
// //           {myPending.length === 0 && (
// //             <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No pending requests.</div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { createSupabaseServerClient } from '@/lib/supabase/server';
// import { acceptRequestAction, rejectRequestAction } from '@/app/actions/requests';

// type PendingRow = {
//   id: string;
//   resource_id: string;
//   borrower_id: string;
//   lender_id: string;
//   total_estimated_credits: number;
//   status: string;
//   resources: { name: string } | { name: string }[] | null;
//   borrower: { username: string } | { username: string }[] | null;
// };

// export default async function ChatsAndRequests() {
//   const supabase = await createSupabaseServerClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) return <div className="rounded-xl border bg-white p-6">Please log in.</div>;

//   // Pending requests
//   const { data: pendingRaw } = await supabase
//     .from('requests')
//     .select('id, resource_id, borrower_id, lender_id, total_estimated_credits, status, resources(name), borrower:profiles!requests_borrower_id_fkey(username)')
//     .eq('status', 'pending')
//     .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
//     .order('created_at', { ascending: false });

//   const pending = (pendingRaw ?? []).map((row => {
//     const r = row as PendingRow;
//     const resource = Array.isArray(r.resources) ? r.resources[0] : r.resources;
//     const borrower = Array.isArray(r.borrower) ? r.borrower[0] : r.borrower;
//     return { ...r, resourceName: resource?.name ?? 'Resource', borrowerName: borrower?.username ?? 'Borrower' };
//   }));

//   // Accepted chats list: get accepted requests for me, then join with chats

//     const { data: acceptedReqs } = await supabase
//     .from('requests')
//     .select('id, resource_id, borrower_id, lender_id, resources(name)')
//     .eq('status', 'accepted')
//     .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
//     .order('created_at', { ascending: false });

//   const acceptedIds = (acceptedReqs ?? []).map(r => r.id);

//   let chatItems: { chatId: string; requestId: string; title: string }[] = [];
//   if (acceptedIds.length > 0) {
//     const { data: chats } = await supabase
//       .from('chats')
//       .select('id, request_id')
//       .in('request_id', acceptedIds);

//     chatItems = (chats ?? []).map(c => {
//       const req = (acceptedReqs ?? []).find(r => r.id === c.request_id)!;
//       const resource = Array.isArray(req.resources) ? req.resources[0] : req.resources;
//       return { chatId: c.id, requestId: c.request_id, title: resource?.name ?? 'Chat' };
//     });
//   }

//   return (
//     <div className="grid gap-8 lg:grid-cols-2">
//       <div>
//         <h1 className="mb-4 text-2xl font-bold">Active Chats</h1>
//         <div className="space-y-3">
//           {chatItems.map(item => (
//             <a key={item.chatId} href={`/chats/${item.chatId}`} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50">
//               <div>
//                 <div className="font-medium">{item.title}</div>
//                 <div className="text-sm text-slate-600">Open chat</div>
//               </div>
//               <span className="text-slate-400">›</span>
//             </a>
//           ))}
//           {chatItems.length === 0 && (
//             <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No chats yet.</div>
//           )}
//         </div>
//       </div>

//       <div>
//         <h2 className="mb-4 text-2xl font-bold">Pending Requests</h2>
//         <div className="space-y-3">
//           {pending.map(req => (
//             <div key={req.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//               <div>
//                 <div className="font-medium">{req.borrowerName}</div>
//                 <div className="text-sm text-slate-600">Request for {req.resourceName}</div>
//               </div>
//               {req.lender_id === user.id ? (
//                 <div className="flex gap-2">
//                   <form action={rejectRequestAction}>
//                     <input type="hidden" name="requestId" value={req.id} />
//                     <button className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">Decline</button>
//                   </form>
//                   <form action={acceptRequestAction}>
//                     <input type="hidden" name="requestId" value={req.id} />
//                     <button className="rounded-full bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Accept</button>
//                   </form>
//                 </div>
//               ) : (
//                 <div className="text-sm text-slate-500">Waiting for lender response</div>
//               )}
//             </div>
//           ))}
//           {pending.length === 0 && (
//             <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No pending requests.</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { acceptRequestAction, rejectRequestAction } from '@/app/actions/requests';

type PendingRow = {
  id: string;
  resource_id: string;
  borrower_id: string;
  lender_id: string;
  total_estimated_credits: number;
  status: string;
  resources: { name: string } | { name: string }[] | null;
  borrower: { username: string } | { username: string }[] | null;
};

export default async function ChatsAndRequests({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const err = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="rounded-xl border bg-white p-6">Please log in.</div>;

  // Pending requests
  const { data: pendingRaw } = await supabase
    .from('requests')
    .select('id, resource_id, borrower_id, lender_id, total_estimated_credits, status, resources(name), borrower:profiles!requests_borrower_id_fkey(username)')
    .eq('status', 'pending')
    .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  const pending = (pendingRaw ?? []).map((row => {
    const r = row as PendingRow;
    const resource = Array.isArray(r.resources) ? r.resources[0] : r.resources;
    const borrower = Array.isArray(r.borrower) ? r.borrower[0] : r.borrower;
    return { ...r, resourceName: resource?.name ?? 'Resource', borrowerName: borrower?.username ?? 'Borrower' };
  }));

  // Accepted chats list
  const { data: acceptedReqs } = await supabase
    .from('requests')
    .select('id, resource_id, borrower_id, lender_id, resources(name)')
    .eq('status', 'accepted')
    .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  const acceptedIds = (acceptedReqs ?? []).map(r => r.id);

  let chatItems: { chatId: string; requestId: string; title: string }[] = [];
  if (acceptedIds.length > 0) {
    const { data: chats } = await supabase
      .from('chats')
      .select('id, request_id')
      .in('request_id', acceptedIds);

    chatItems = (chats ?? []).map(c => {
      const req = (acceptedReqs ?? []).find(r => r.id === c.request_id)!;
      const resource = Array.isArray(req.resources) ? req.resources[0] : req.resources;
      return { chatId: c.id, requestId: c.request_id, title: resource?.name ?? 'Chat' };
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* 💥 Drop your error message right here at the top */}
      {err && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          Error: {err}
        </div>
      )}

      <div>
        <h1 className="mb-4 text-2xl font-bold">Active Chats</h1>
        <div className="space-y-3">
          {chatItems.map(item => (
            <a
              key={item.chatId}
              href={`/chats/${item.chatId}`}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
            >
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-slate-600">Open chat</div>
              </div>
              <span className="text-slate-400">›</span>
            </a>
          ))}
          {chatItems.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              No chats yet.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Pending Requests</h2>
        <div className="space-y-3">
          {pending.map(req => (
            <div
              key={req.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="font-medium">{req.borrowerName}</div>
                <div className="text-sm text-slate-600">
                  Request for {req.resourceName}
                </div>
              </div>
              {req.lender_id === user.id ? (
                <div className="flex gap-2">
                  <form action={rejectRequestAction}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <button className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200">
                      Decline
                    </button>
                  </form>
                  <form action={acceptRequestAction}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <button className="rounded-full bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
                      Accept
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Waiting for lender response
                </div>
              )}
            </div>
          ))}
          {pending.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              No pending requests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
