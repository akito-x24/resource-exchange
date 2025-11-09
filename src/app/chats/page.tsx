import { createSupabaseServerClient } from '@/lib/supabase/server';
import { acceptRequestAction, rejectRequestAction } from '@/app/actions/requests';

type PendingRow = {
  id: string;
  resource_id: string;
  borrower_id: string;
  lender_id: string;
  total_estimated_credits: number;
  status: string;
  resources: { name: string } | { name: string }[] | null;
  borrower: { username: string; avatar_url?: string } | { username: string; avatar_url?: string }[] | null;
};

export default async function ChatsAndRequests({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const err = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

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

  /* ----------------------------
     🕓 FETCH ALL REQUESTS (any status)
  ----------------------------- */
  const { data: allReqs, error: reqErr } = await supabase
    .from('requests')
    .select(`
      id,
      resource_id,
      borrower_id,
      lender_id,
      total_estimated_credits,
      status,
      resources(name),
      borrower:profiles!requests_borrower_id_fkey(username, avatar_url)
    `)
    .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (reqErr) console.error('Error fetching requests:', reqErr);

  const allRequestIds = (allReqs ?? []).map((r) => r.id);

  let chatItems:
    | {
        chatId: string;
        requestId: string;
        title: string;
        borrowerName: string;
        avatar: string;
        status: string;
      }[]
    | [] = [];

  if (allRequestIds.length > 0) {
    const { data: chats } = await supabase
      .from('chats')
      .select('id, request_id')
      .in('request_id', allRequestIds);

    chatItems = (chats ?? []).map((c) => {
      const req = (allReqs ?? []).find((r) => r.id === c.request_id)!;
      const resource = Array.isArray(req.resources) ? req.resources[0] : req.resources;
      const borrower = Array.isArray(req.borrower) ? req.borrower[0] : req.borrower;
      return {
        chatId: c.id,
        requestId: c.request_id,
        title: resource?.name ?? 'Chat',
        borrowerName: borrower?.username ?? 'User',
        avatar: borrower?.avatar_url ?? '',
        status: req.status,
      };
    });
  }

  /* ----------------------------
     🕓 FETCH PENDING REQUESTS
  ----------------------------- */
  const { data: pendingRaw } = await supabase
    .from('requests')
    .select(
      'id, resource_id, borrower_id, lender_id, total_estimated_credits, status, resources(name), borrower:profiles!requests_borrower_id_fkey(username, avatar_url)'
    )
    .eq('status', 'pending')
    .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  const pending = (pendingRaw ?? []).map((r: any) => {
    const resource = Array.isArray(r.resources) ? r.resources[0] : r.resources;
    const borrower = Array.isArray(r.borrower) ? r.borrower[0] : r.borrower;
    return {
      ...r,
      resourceName: resource?.name ?? 'Resource',
      borrowerName: borrower?.username ?? 'Borrower',
      borrowerAvatar: borrower?.avatar_url ?? '',
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {err && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          Error: {err}
        </div>
      )}

      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-10">
        Chats & Requests
      </h1>

      {/* Pending Requests */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Pending Requests</h2>

        <div className="space-y-4">
          {pending.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm border border-slate-200 hover:-translate-y-0.5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={req.borrowerAvatar || '/default-avatar.png'}
                  alt={req.borrowerName}
                  className="h-10 w-10 rounded-full object-cover bg-slate-200"
                />
                <div>
                  <div className="font-semibold text-slate-800">
                    {req.borrowerName}
                  </div>
                  <div className="text-sm text-blue-600">
                    Request for {req.resourceName}
                  </div>
                </div>
              </div>

              {req.lender_id === user.id ? (
                <div className="flex gap-2">
                  <form action={rejectRequestAction}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <button className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-200 transition">
                      Decline
                    </button>
                  </form>
                  <form action={acceptRequestAction}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <button className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                      Accept
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Waiting for lender response
                </div>
              )}
            </div>
          ))}

          {pending.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              No pending requests.
            </div>
          )}
        </div>
      </section>

      {/* All Chats */}
      <section className="mb-10">
        <h2 className="text-xl font-medium text-slate-800 py-6 mb-6">All Chats</h2>

        <div className="space-y-4">
          {chatItems.map((item) => {
            const statusColor =
              item.status === 'completed'
                ? 'text-green-600'
                : item.status === 'cancelled'
                ? 'text-red-600'
                : item.status === 'accepted'
                ? 'text-blue-600'
                : 'text-yellow-600';

            const opacity =
              item.status === 'completed' || item.status === 'cancelled'
                ? 'opacity-80'
                : 'opacity-100';

            return (
              <a
                key={item.chatId}
                href={`/chats/${item.chatId}`}
                className={`flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm border border-slate-200 hover:-translate-y-0.5 hover:shadow-md transition ${opacity}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar || '/default-avatar.png'}
                    alt={item.borrowerName}
                    className="h-10 w-10 rounded-full object-cover bg-slate-200"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">
                      {item.borrowerName}
                    </div>
                    <div className={`text-sm font-medium ${statusColor}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </div>
                    <div className="text-sm text-blue-600">
                      Discussing about {item.title}
                    </div>
                  </div>
                </div>
                <span className="text-slate-400 text-xl">›</span>
              </a>
            );
          })}

          {chatItems.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              No chats yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
