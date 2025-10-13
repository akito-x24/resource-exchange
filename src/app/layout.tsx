// // import './globals.css';
// // import Link from 'next/link';
// // import { TopNav } from '@/components/TopNav';
// // import { Inter } from 'next/font/google';

// // const inter = Inter({ subsets: ['latin'] });

// // export const metadata = { title: 'Resource Exchange', description: 'P2P Resource Exchange' };

// // export default function RootLayout({ children }: { children: React.ReactNode }) {
// //   return (
// //     <html lang="en" className="h-full">
// //       <body className={`${inter.className} h-full bg-slate-50 text-slate-900`}>
// //         <TopNav />
// //         <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
// //       </body>
// //     </html>
// //   );
// // }


// import './globals.css';
// import { Inter } from 'next/font/google';
// import { createSupabaseServerClient } from '@/lib/supabase/server';
// import { TopNav } from '@/components/TopNav';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = { title: 'Resource Exchange', description: 'P2P Resource Exchange' };

// export default async function RootLayout({ children }: { children: React.ReactNode }) {
//   const supabase = createSupabaseServerClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   const { data: profile } = user
//     ? await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
//     : { data: null };

//   return (
//     <html lang="en">
//       <body className={`${inter.className} bg-slate-50 text-slate-900`}>
//         <TopNav user={user} profile={profile} />
//         <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
//       </body>
//     </html>
//   );
// }

import './globals.css';
import { Inter } from 'next/font/google';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import TopNav from '@/components/TopNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata = { title: 'Resource Exchange', description: 'P2P Resource Exchange' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
    : { data: null };

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <TopNav user={user ? { id: user.id } : null} profile={profile} />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}