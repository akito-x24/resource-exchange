'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // ✅ for highlighting active route
import logo from '@/app/favicon.ico'; // ✅ Local logo

type Props = {
  user: { id: string } | null;
  profile: { username?: string; avatar_url?: string } | null;
  wallet?: { available_credits?: number; locked_credits?: number } | null;
};

export default function TopNav({ user, profile, wallet }: Props) {
  const pathname = usePathname();
  const available = wallet?.available_credits ?? 0;
  const locked = wallet?.locked_credits ?? 0;

  const navLinks = [
    { href: '/browse', label: 'Home' },
    { href: '/chats', label: 'Chats' },
    { href: '/resources', label: 'Your Items' },
    { href: '/Requests', label: 'Borrow Requests' },
  ];

  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur"
    >
      <div className="w-full flex items-center justify-between px-8 py-3">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/browse" className="flex items-center gap-3">
            <Image
              src={logo}
              alt="Resource Exchange Logo"
              width={40}
              height={40}
              className="rounded-md"
              priority
            />
            <span className="text-2xl font-extrabold text-black">
              Resource Exchange
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className={`px-3 py-2 rounded-md text-sm transition ${
                  pathname === href
                    ? 'bg-slate-100 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Credits + Auth */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-5 rounded-full px-5 py-2 text-xs text-slate-700 bg-green-100">
              <span className="font-medium">{available} credits</span>
              {locked > 0 && (
                <span className="text-slate-500">({locked} locked)</span>
              )}
            </div>
          )}

          {!user ? (
            <Link
              href="/login"
              className="rounded-full border border-blue-600 text-blue-600 text-sm px-5 py-2 hover:bg-blue-50 transition"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700">
                {profile?.username || 'User'}
              </span>

              <Link href="/profile" className="group">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="h-11 w-11 rounded-full ring-1 ring-slate-200 group-hover:ring-blue-500 transition"
                    alt="Your avatar"
                  />
                ) : (
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-200 text-sm text-slate-600 group-hover:ring-2 group-hover:ring-blue-500 transition">
                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}