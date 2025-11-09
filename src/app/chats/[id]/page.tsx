// import { createSupabaseServerClient } from '@/lib/supabase/server';
// import ChatRoomClient from '@/components/ChatRoomClient';
// import {
//   completeRequestAction,
//   cancelRequestAction,
// } from '@/app/actions/requests';
// import { Camera, CreditCard, CheckCircle } from 'lucide-react';
// import ReviewModal from '@/components/ReviewModal'; // ✅ ADDED IMPORT

// type ReqRow = {
//   id: string;
//   resource_id: string; // ✅ Added this missing field
//   total_estimated_credits: number;
//   lender_id: string;
//   borrower_id: string;
//   status: string;
//   resources: { name: string } | { name: string }[] | null;
// };

// export default async function ChatRoomPage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user)
//     return (
//       <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 px-6">
//         <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
//           <h2 className="text-xl font-semibold text-slate-800 mb-2">
//             Please log in
//           </h2>
//           <p className="text-slate-600 text-sm">
//             You need to be signed in to access your chats.
//           </p>
//         </div>
//       </div>
//     );

//   const { data: chat } = await supabase
//     .from('chats')
//     .select('id, request_id')
//     .eq('id', params.id)
//     .single();

//   if (!chat)
//     return (
//       <div className="flex items-center justify-center h-[80vh] px-6">
//         <div className="rounded-2xl border bg-white p-8 shadow-sm text-center text-slate-700">
//           Chat not found.
//         </div>
//       </div>
//     );

//   const { data: reqRaw } = await supabase
//     .from('requests')
//     .select(
//       'id, resource_id, total_estimated_credits, lender_id, borrower_id, status, resources(name)'
//     )
//     .eq('id', chat.request_id)
//     .single();

//   const req = reqRaw as ReqRow | null;
//   const resRec = Array.isArray(req?.resources)
//     ? req?.resources?.[0]
//     : req?.resources;
//   const requestTitle = resRec?.name ?? 'Resource';
//   const requestCredits = req?.total_estimated_credits ?? 0;

//   const isLender = !!req && user.id === req.lender_id;
//   const isBorrower = !!req && user.id === req.borrower_id;
//   const recipientId = isBorrower
//     ? req?.lender_id ?? null
//     : isLender
//     ? req?.borrower_id ?? null
//     : null;

//   const { data: initialMessages } = await supabase
//     .from('messages')
//     .select('id, chat_id, sender_id, body, kind, metadata, created_at')
//     .eq('chat_id', chat.id)
//     .order('created_at', { ascending: true });

//   return (
//     <div className="flex h-[calc(98vh-60px)] bg-slate-50">
//       {/* LEFT SIDE - Chat Area */}
//       <section className="flex-1 border-r border-slate-200 flex flex-col">
//         <div className="px-6 py-6 border-l-stone-300">
//           <h1 className="text-xl font-semibold text-slate-800">
//             Chat with {isLender ? 'Borrower' : 'Lender'}
//           </h1>
//         </div>

//         <div className="flex-1 overflow-y-auto px-6 py-5">
//           <ChatRoomClient
//             userId={user.id}
//             chatId={chat.id}
//             requestId={chat.request_id}
//             requestTitle={requestTitle}
//             requestCredits={requestCredits}
//             recipientId={recipientId}
//             canTransfer={isBorrower}
//             initialMessages={initialMessages ?? []}
//           />
//         </div>
//       </section>

//       {/* RIGHT SIDE - Request Details */}
//       <aside className="relative w-[340px] bg-white p-6 shadow-inner">
//         <h3 className="mb-4 text-lg font-semibold text-slate-800">
//           Request Details
//         </h3>

//         <div className="space-y-5 text-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 text-slate-700">
//               <Camera size={18} />
//               <span>{requestTitle ? 'Item name' : 'Resource'}</span>
//             </div>
//             <span className="font-medium text-slate-900">
//               {requestTitle || 'No title available'}
//             </span>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 text-slate-700">
//               <CreditCard size={18} />
//               <span>Credits</span>
//             </div>
//             <span className="font-medium text-blue-700">{requestCredits}</span>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 text-slate-700">
//               <CheckCircle size={18} />
//               <span>Status</span>
//             </div>
//             <span
//               className={`font-medium ${
//                 req?.status === 'completed'
//                   ? 'text-green-600'
//                   : req?.status === 'cancelled'
//                   ? 'text-red-600'
//                   : 'text-yellow-600'
//               }`}
//             >
//               {req?.status ?? 'Pending'}
//             </span>
//           </div>
//         </div>

//         {req?.status === 'completed' && (
//           <>
//             <div className="mt-10 text-center text-green-600 text-sm font-medium">
//               Transaction Completed ✅
//             </div>

//             {/* ✅ Review Modal Trigger */}
//             <div className="mt-6">
//               <ReviewModal
//                 resourceId={req.resource_id}
//                 requestId={req.id}
//                 revieweeId={isLender ? req.borrower_id : req.lender_id}
//               />
//             </div>
//           </>
//         )}

//         {/* Buttons */}
//         {req?.status !== 'completed' && (
//           <div className="absolute bottom-8 left-6 right-6">
//             {isLender ? (
//               <form action={completeRequestAction}>
//                 <input type="hidden" name="requestId" value={chat.request_id} />
//                 <button className="w-full rounded-full bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 transition shadow-md">
//                   Mark as Complete
//                 </button>
//               </form>
//             ) : (
//               <form action={cancelRequestAction}>
//                 <input type="hidden" name="requestId" value={chat.request_id} />
//                 <button className="w-full rounded-full bg-red-500 py-2.5 font-medium text-white hover:bg-red-600 transition shadow-md">
//                   Cancel Request
//                 </button>
//               </form>
//             )}
//           </div>
//         )}
//       </aside>
//     </div>
//   );
// }


import { createSupabaseServerClient } from '@/lib/supabase/server';
import ChatRoomWrapper from '@/components/ChatRoomWrapper';

export default async function ChatRoomPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 px-6">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Please log in</h2>
          <p className="text-slate-600 text-sm">
            You need to be signed in to access your chats.
          </p>
        </div>
      </div>
    );

  const { data: chat } = await supabase
    .from('chats')
    .select('id, request_id')
    .eq('id', params.id)
    .single();

  if (!chat)
    return (
      <div className="flex items-center justify-center h-[80vh] px-6">
        <div className="rounded-2xl border bg-white p-8 shadow-sm text-center text-slate-700">
          Chat not found.
        </div>
      </div>
    );

  const { data: reqRaw } = await supabase
    .from('requests')
    .select(
      'id, resource_id, total_estimated_credits, lender_id, borrower_id, status, resources(name)'
    )
    .eq('id', chat.request_id)
    .single();

  const { data: initialMessages } = await supabase
    .from('messages')
    .select('id, chat_id, sender_id, body, kind, metadata, created_at')
    .eq('chat_id', chat.id)
    .order('created_at', { ascending: true });

  return (
    <ChatRoomWrapper
      user={user}
      chat={chat}
      reqRaw={reqRaw}
      initialMessages={initialMessages ?? []}
    />
  );
}
