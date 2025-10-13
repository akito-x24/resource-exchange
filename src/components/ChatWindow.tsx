// 'use client';
// import { useRef, useEffect, useState } from 'react';
// import { useAppStore } from '@/store/useAppStore';

// export function ChatWindow({ chatId }: { chatId: string }) {
//   const me = useAppStore(s => s.me);
//   const messages = useAppStore(s => s.getChatMessages(chatId));
//   const sendMessage = useAppStore(s => s.sendMessage);
//   const sendTransfer = useAppStore(s => s.sendTransferMessage);
//   const [text, setText] = useState('');
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
//   }, [messages.length]);

//   function onSend() {
//     if (!text.trim()) return;
//     sendMessage(chatId, me.id, text.trim());
//     setText('');
//   }

//   return (
//     <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//       <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
//         {messages.map(m => {
//           const isMe = m.senderId === me.id;

//           if (m.kind === 'system' || m.kind === 'transfer') {
//             return (
//               <div key={m.id} className="relative my-3 flex items-center">
//                 <div className="h-px flex-1 bg-slate-200" />
//                 <span className="mx-3 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
//                   {m.kind === 'transfer' ? `✔ ${m.body}` : m.body}
//                 </span>
//                 <div className="h-px flex-1 bg-slate-200" />
//               </div>
//             ); 
//           }

//           return (
//             <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
//               <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-slate-100 text-slate-900'}`}>
//                 {m.body}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 p-3">
//         <input
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
//           placeholder="Type a message..."
//           onKeyDown={(e) => e.key === 'Enter' && onSend()}
//         />
//         <button onClick={onSend} className="rounded-full bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700">Send</button>
//         <button onClick={() => sendTransfer(chatId, me.id, 50)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">+50 credits</button>
//       </div>
//     </div>
//   );
// }


'use client';
import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { Message } from '@/types';

export function ChatWindow({ chatId }: { chatId: string }) {
  const me = useAppStore((s) => s.me);
  const allMessages = useAppStore((s) => s.messages);
  const messages: Message[] = allMessages
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const sendMessage = useAppStore((s) => s.sendMessage);
  const sendTransfer = useAppStore((s) => s.sendTransferMessage);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  function onSend() {
    if (!text.trim()) return;
    sendMessage(chatId, me.id, text.trim());
    setText('');
  }

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m) => {
          const isMe = m.senderId === me.id;

          if (m.kind === 'system' || m.kind === 'transfer') {
            return (
              <div key={m.id} className="relative my-3 flex items-center">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="mx-3 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {m.kind === 'transfer' ? `✔ ${m.body}` : m.body}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            );
          }

          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-slate-100 text-slate-900'}`}>
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        <button onClick={onSend} className="rounded-full bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700">Send</button>
        <button onClick={() => sendTransfer(chatId, me.id, 50)} className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">+50 credits</button>
      </div>
    </div>
  );
}