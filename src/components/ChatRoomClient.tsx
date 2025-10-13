'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { sendMessageAction } from '@/app/actions/messages';

type Msg = { id: string; chat_id: string; sender_id: string; body: string; kind: string; metadata: any; created_at: string };

export default function ChatRoomClient({
  userId, chatId, requestId, requestTitle, requestCredits, initialMessages,
}: {
  userId: string;
  chatId: string;
  requestId: string;
  requestTitle?: string;
  requestCredits: number;
  initialMessages: Msg[];
}) {
  const supabase = createSupabaseBrowserClient();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, (payload) => {
        setMessages((m) => [...m, payload.new as Msg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatId, supabase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText('');
    startTransition(async () => { await sendMessageAction(chatId, body); });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section>
        <div ref={scrollRef} className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border bg-white p-4">
          {/* render messages here */}
        </div>
        <form onSubmit={onSend} className="mt-3 flex items-center gap-2">
          <input value={text} onChange={(e)=>setText(e.target.value)} className="flex-1 rounded-full border px-4 py-2" />
          <button disabled={isPending} className="rounded-full bg-blue-600 px-4 py-2 text-white disabled:opacity-60">Send</button>
        </form>
      </section>
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border bg-white p-5">
          <h3 className="mb-2 font-semibold">Request Details</h3>
          <div className="text-sm">
            <div className="flex justify-between"><span>Resource</span><span className="font-medium">{requestTitle ?? '-'}</span></div>
            <div className="flex justify-between"><span>Credits</span><span className="font-medium">{requestCredits}</span></div>
            <div className="flex justify-between"><span>Status</span><span className="font-medium">Accepted</span></div>
          </div>
        </div>
      </aside>
    </div>
  );
}