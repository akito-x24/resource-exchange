'use client';

import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import type { Chat, Request } from '@/types';

export function ChatList() {
  const me = useAppStore((s) => s.me);
  const users = useAppStore((s) => s.users);
  const chats = useAppStore((s) => s.chats);
  const requests = useAppStore((s) => s.requests);

  const myChats: Chat[] = chats.filter((c) => c.participantIds.includes(me.id) && c.isOpen);
  const reqs: Request[] = requests;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-lg font-semibold">Active Chats</h2>
        <div className="space-y-3">
          {myChats.length === 0 && (
            <div className="rounded-md border bg-white p-4 text-sm text-gray-600">No active chats</div>
          )}
          {myChats.map((c) => {
            const otherId = c.participantIds.find((id) => id !== me.id)!;
            const u = users[otherId];
            const req = reqs.find((r) => r.id === c.requestId);
            return (
              <Link key={c.id} href={`/chats/${c.id}`} className="flex items-center justify-between rounded-md border bg-white p-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <img src={u.avatarUrl} className="h-8 w-8 rounded-full" alt="" />
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-600">
                      {req ? `Discussing ${req.estimatedCredits} credits` : 'Chat'}
                    </div>
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}