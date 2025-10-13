import { createSupabaseServerClient } from '@/lib/supabase/server';
import ChatRoomClient from '@/components/ChatRoomClient';
import { completeRequestAction, cancelRequestAction } from '@/app/actions/requests';

type ReqRow = {
  id: string;
  total_estimated_credits: number;
  lender_id: string;
  resources: { name: string } | { name: string }[] | null;
};

export default async function ChatRoomPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="rounded-xl border bg-white p-6">Please log in.</div>;

  const { data: chat } = await supabase
    .from('chats')
    .select('id, request_id')
    .eq('id', params.id)
    .single();
  if (!chat) return <div className="rounded-xl border bg-white p-6">Chat not found.</div>;

  const { data: reqRaw } = await supabase
    .from('requests')
    .select('id, total_estimated_credits, lender_id, resources(name)')
    .eq('id', chat.request_id)
    .single();

  const req = reqRaw as ReqRow | null;
  const resRec = Array.isArray(req?.resources) ? req?.resources?.[0] : req?.resources;
  const requestTitle = resRec?.name;
  const requestCredits = req?.total_estimated_credits ?? 0;
  const isLender = !!req && user.id === req.lender_id;

  const { data: initialMessages } = await supabase
    .from('messages')
    .select('id, chat_id, sender_id, body, kind, metadata, created_at')
    .eq('chat_id', chat.id)
    .order('created_at', { ascending: true });

  return (
    <div>
      <ChatRoomClient
        userId={user.id}
        chatId={chat.id}
        requestId={chat.request_id}
        requestTitle={requestTitle}
        requestCredits={requestCredits}
        initialMessages={initialMessages ?? []}
      />

      {isLender && (
        <div className="mt-4 flex gap-2">
          <form action={completeRequestAction}>
            <input type="hidden" name="requestId" value={chat.request_id} />
            <button className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Mark Complete
            </button>
          </form>
          <form action={cancelRequestAction}>
            <input type="hidden" name="requestId" value={chat.request_id} />
            <button className="rounded-full bg-slate-100 px-4 py-2 hover:bg-slate-200">
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}