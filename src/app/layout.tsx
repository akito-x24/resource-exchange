// import './globals.css';
// import { Inter } from 'next/font/google';
// import { createSupabaseServerClient } from '@/lib/supabase/server';
// import TopNav from '@/components/TopNav';
// // import { LendFAB } from '@/components/LendFAB';

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'Resource Exchange',
//   description: 'P2P Resource Exchange',
// };

// export default async function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const { data: profile } = user
//     ? await supabase
//         .from('profiles')
//         .select('username, avatar_url')
//         .eq('id', user.id)
//         .single()
//     : { data: null };

//   const { data: wallet } = user
//     ? await supabase
//         .from('wallets')
//         .select('available_credits, locked_credits')
//         .eq('user_id', user.id)
//         .single()
//     : { data: null };

//   return (
//     <html lang="en">
//       <body className={`${inter.className} bg-slate-50 text-slate-900`}>
//         <TopNav
//           user={user ? { id: user.id } : null}
//           profile={profile}
//           wallet={wallet}
//         />
//         <main className="mx-auto w-full">{children}</main>
//       </body>
//     </html>
//   );
// }
 
import './globals.css';
import { Inter } from 'next/font/google';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import TopNav from '@/components/TopNav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Resource Exchange',
  description: 'P2P Resource Exchange',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()
    : { data: null };

  const { data: wallet } = user
    ? await supabase
        .from('wallets')
        .select('available_credits, locked_credits')
        .eq('user_id', user.id)
        .single()
    : { data: null };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300`}
      >
        <TopNav
          user={user ? { id: user.id } : null}
          profile={profile}
          wallet={wallet}
        />
        <main className="mx-auto w-full min-h-screen">{children}</main>
      </body>
    </html>
  );
}
