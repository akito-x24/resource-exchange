'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { sendMessageAction } from '@/app/actions/messages';
import { Paperclip } from 'lucide-react';

type Msg = {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string | null;
  kind: 'text' | 'system' | 'transfer' | 'image';
  image_url?: string | null;
  metadata?: any;
  created_at: string;
};

export default function ChatRoomClient({
  userId,
  chatId,
  requestId,
  requestTitle,
  requestCredits,
  initialMessages,
  recipientId,
  canTransfer,
}: {
  userId: string;
  chatId: string;
  requestId: string;
  requestTitle?: string;
  requestCredits: number;
  initialMessages: Msg[];
  recipientId: string | null;
  canTransfer: boolean;
}) {
  const supabase = createSupabaseBrowserClient();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🔁 realtime listener
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => setMessages((m) => [...m, payload.new as Msg])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, supabase]);

  // auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  // send text message
  function onSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText('');
    setErr(null);
    startTransition(async () => {
      const res = await sendMessageAction(chatId, body);
      if ((res as any)?.error) {
        setText(body);
        setErr((res as any).error as string);
      }
    });
  }

  // 📎 handle file upload
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset file input

    setSending(true);
    setErr(null);

    const res = await sendMessageAction(chatId, '', file);
    if ((res as any)?.error) setErr((res as any).error as string);

    setSending(false);
  }

  const canSend = text.trim().length > 0 && !isPending && !sending;

  // 💬 message bubble (with image support)
  const Bubble = ({
    mine,
    children,
  }: {
    mine: boolean;
    children: React.ReactNode;
  }) => (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] break-words rounded-2xl px-4 py-2 text-sm shadow-sm ${
          mine
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-slate-100 text-slate-900 rounded-bl-md'
        }`}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_10px]">
      {/* Chat Section */}
      <section>
        <div className="flex h-[72vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Chat Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50"
          >
            {messages.map((m) => {
              if (m.kind === 'system' || m.kind === 'transfer') {
                const label =
                  m.kind === 'transfer' ? `💰 ${m.body}` : m.body;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-center my-3"
                  >
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700 shadow-sm">
                      {label}
                    </span>
                  </div>
                );
              }

              // 🖼️ Display image messages
              if (m.kind === 'image' && m.image_url) {
                return (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <img
                      src={m.image_url}
                      alt="Sent image"
                      className="max-w-[60%] rounded-lg shadow-sm border border-slate-200"
                    />
                  </div>
                );
              }

              // 💬 Normal text messages
              return (
                <Bubble key={m.id} mine={m.sender_id === userId}>
                  {m.body}
                </Bubble>
              );
            })}
          </div>

          {/* Send Box */}
          <form
            onSubmit={onSend}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
          >
            {/* 📎 File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-500 hover:text-blue-600 transition"
            >
              <Paperclip size={24} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (err) setErr(null);
              }}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button
              disabled={!canSend}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending || sending ? '...' : 'Send'}
            </button>
          </form>

          {err && <div className="px-5 pb-3 text-xs text-red-600">{err}</div>}
        </div>
      </section>
    </div>
  );
}
