// // 'use client';
// // import Link from 'next/link';
// // import { usePathname } from 'next/navigation';
// // import { useAppStore } from '@/store/useAppStore';
// // import { Plus, Search } from 'lucide-react';
// // import { LendResourceModal } from './LendResourceModal';
// // import { useState } from 'react';

// // const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
// //   const pathname = usePathname();
// //   const active = pathname.startsWith(href);
// //   return (
// //     <Link
// //       href={href}
// //       className={`px-3 py-2 rounded-md text-sm font-medium ${
// //         active ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100' : 'text-slate-700 hover:bg-slate-100'
// //       }`}
// //     >
// //       {children}
// //     </Link>
// //   );
// // };

// // export function TopNav() {
// //   const me = useAppStore(s => s.me);
// //   const [open, setOpen] = useState(false);

// //   return (
// //     <>
// //       <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
// //         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
// //           <div className="flex items-center gap-6">
// //             <Link href="/browse" className="text-xl font-semibold text-blue-700">Resource Exchange</Link>
// //             <nav className="hidden md:flex items-center gap-1">
// //               <NavLink href="/browse">Browse</NavLink>
// //               <NavLink href="/resources">My Resources</NavLink>
// //               <NavLink href="/chats">Requests</NavLink>
// //             </nav>
// //           </div>

// //           <div className="flex items-center gap-3">
// //             <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
// //               <Search size={16} className="text-slate-400" />
// //               <input className="w-48 outline-none placeholder:text-slate-400" placeholder="Search resources..." />
// //             </div>

// //             <button
// //               onClick={() => setOpen(true)}
// //               className="hidden sm:flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700"
// //             >
// //               <Plus size={18} /> Lend Something
// //             </button>

// //             <Link href="/login" className="hidden sm:inline-block rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">
// //               Login
// //             </Link>
// //             <div className="hidden sm:flex items-center gap-2">
// //               <img src={me.avatarUrl} className="h-8 w-8 rounded-full ring-1 ring-slate-200" alt="" />
// //               <span className="text-sm text-slate-700">{me.name}</span>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       <LendResourceModal open={open} onOpenChange={setOpen} />
// //     </>
// //   );
// // }

// 'use client';
// import Link from 'next/link';
// import { useState } from 'react';
// import { Plus, Search } from 'lucide-react';
// import { LendResourceModal } from './LendResourceModal';
// import { signOutAction } from '@/app/actions/auth';

// export function TopNav({ user, profile }: { user: any; profile: { username?: string; avatar_url?: string } | null }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
//           <div className="flex items-center gap-6">
//             <Link href="/browse" className="text-xl font-semibold text-blue-700">Resource Exchange</Link>
//             <nav className="hidden md:flex items-center gap-1">
//               <Link href="/browse" className="px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100">Browse</Link>
//               <Link href="/resources" className="px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100">My Resources</Link>
//               <Link href="/chats" className="px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100">Requests</Link>
//             </nav>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="hidden md:flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm text-slate-600">
//               <Search size={16} className="text-slate-400" />
//               <input className="w-48 outline-none placeholder:text-slate-400" placeholder="Search resources..." />
//             </div>
//             <button onClick={() => setOpen(true)} className="hidden sm:flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
//               <Plus size={18} /> Lend Something
//             </button>

//             {!user ? (
//               <Link href="/login" className="hidden sm:inline-block rounded-full border px-3 py-1.5 text-sm hover:bg-slate-50">Login</Link>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <img src={profile?.avatar_url || 'https://i.pravatar.cc/100?img=5'} className="h-8 w-8 rounded-full ring-1 ring-slate-200" alt="" />
//                 <span className="text-sm text-slate-700">{profile?.username || 'You'}</span>
//                 <form action={signOutAction}>
//                   <button className="rounded-full border px-3 py-1.5 text-sm hover:bg-slate-50">Sign out</button>
//                 </form>
//               </div>
//             )}
//           </div>
//         </div>
//       </header>

//       <LendResourceModal open={open} onOpenChange={setOpen} />
//     </>
//   );
// }


'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { LendResourceModal } from './LendResourceModal';
import { signOutAction } from '@/app/actions/auth';

type Props = {
  user: { id: string } | null;
  profile: { username?: string; avatar_url?: string } | null;
};

export default function TopNav({ user, profile }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/browse" className="text-xl font-semibold text-blue-700">Resource Exchange</Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/browse" className="px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100">Browse</Link>
              <Link href="/resources" className="px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100">My Resources</Link>
              <Link href="/chats" className="px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100">Requests</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm text-slate-600">
              <Search size={16} className="text-slate-400" />
              <input className="w-48 outline-none placeholder:text-slate-400" placeholder="Search resources..." />
            </div>
            <button onClick={() => setOpen(true)} className="hidden sm:flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <Plus size={18} /> Lend Something
            </button>

            {!user ? (
              <Link href="/login" className="hidden sm:inline-block rounded-full border px-3 py-1.5 text-sm hover:bg-slate-50">Login</Link>
            ) : (
              <div className="flex items-center gap-2">
                <img src={profile?.avatar_url || 'https://i.pravatar.cc/100?img=5'} className="h-8 w-8 rounded-full ring-1 ring-slate-200" alt="" />
                <span className="text-sm text-slate-700">{profile?.username || 'You'}</span>
                <form action={signOutAction}>
                  <button className="rounded-full border px-3 py-1.5 text-sm hover:bg-slate-50">Sign out</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      <LendResourceModal open={open} onOpenChange={setOpen} />
    </>
  );
}