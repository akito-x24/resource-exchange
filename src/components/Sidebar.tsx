'use client';

import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

// export function Sidebar() {
//   const { me, users, chats, requests } = useAppStore((s) => ({
//     me: s.me,
//     users: s.users,
//     chats: s.chats,
//     requests: s.requests,
//   }));

export function Sidebar() {
  // Use separate selectors. Do NOT return a new object/array from the selector.
  const me = useAppStore((s) => s.me);
  const users = useAppStore((s) => s.users);
  const chats = useAppStore((s) => s.chats);
  const requests = useAppStore((s) => s.requests);


  const myChats = chats.filter((c) => c.participantIds.includes(me.id) && c.isOpen);
  const myPending = requests.filter(
    (r) =>
      (r.borrowerId === me.id || r.lenderId === me.id) &&
      r.status === 'pending'
  );

  const items = [
    ...myChats.slice(0, 4).map((c) => {
      const otherId = c.participantIds.find((id) => id !== me.id)!;
      return {
        id: c.id,
        title: users[otherId]?.name ?? 'User',
        subtitle: 'Active chat',
        href: `/chats/${c.id}`,
      };
    }),
    ...myPending.slice(0, 4).map((r) => ({
      id: r.id,
      title: 'Pending Request',
      subtitle: `Offer: ${r.estimatedCredits} credits`,
      href: '/chats',
    })),
  ];

  return (
    <aside className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Chat & Requests</h2>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-600">
              No chats yet.
            </div>
          ) : (
            items.map((it) => (
              <Link
                key={it.id}
                href={it.href}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
              >
                <div className="h-9 w-9 flex-shrink-0 rounded-full bg-slate-100 ring-1 ring-slate-200" />
                <div>
                  <div className="text-sm font-medium">{it.title}</div>
                  <div className="text-xs text-slate-600">{it.subtitle}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

// 'use client';

// import Link from 'next/link';
// import { useAppStore } from '@/store/useAppStore';

// export function Sidebar() {
//   // Use separate selectors. Do NOT return a new object/array from the selector.
//   const me = useAppStore((s) => s.me);
//   const users = useAppStore((s) => s.users);
//   const chats = useAppStore((s) => s.chats);
//   const requests = useAppStore((s) => s.requests);

//   // Compute derived data locally (outside selectors)
//   const myChats = chats.filter((c) => c.participantIds.includes(me.id) && c.isOpen);
//   const myPending = requests.filter(
//     (r) =>
//       (r.borrowerId === me.id || r.lenderId === me.id) &&
//       r.status === 'pending'
//   );

//   const items = [
//     ...myChats.slice(0, 4).map((c) => {
//       const otherId = c.participantIds.find((id) => id !== me.id)!;
//       return {
//         id: c.id,
//         title: users[otherId]?.name ?? 'User',
//         subtitle: 'Active chat',
//         href: `/chats/${c.id}`,
//       };
//     }),
//     ...myPending.slice(0, 4).map((r) => ({
//       id: r.id,
//       title: 'Pending Request',
//       subtitle: `Offer: ${r.estimatedCredits} credits`,
//       href: '/chats',
//     })),
//   ];

//   return (
//     <aside className="space-y-3">
//       <div className="rounded-2xl border border-slate-200 bg-white p-4">
//         <h2 className="mb-3 text-lg font-semibold">Chat & Requests</h2>
//         <div className="space-y-2">
//           {items.length === 0 ? (
//             <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-600">
//               No chats yet.
//             </div>
//           ) : (
//             items.map((it) => (
//               <Link
//                 key={it.id}
//                 href={it.href}
//                 className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
//               >
//                 <div className="h-9 w-9 flex-shrink-0 rounded-full bg-slate-100 ring-1 ring-slate-200" />
//                 <div>
//                   <div className="text-sm font-medium">{it.title}</div>
//                   <div className="text-xs text-slate-600">{it.subtitle}</div>
//                 </div>
//               </Link>
//             ))
//           )}
//         </div>
//       </div>
//     </aside>
//   );
// }