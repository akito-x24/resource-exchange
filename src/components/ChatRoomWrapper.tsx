'use client';

import { useState, useEffect } from 'react';
import ChatRoomClient from '@/components/ChatRoomClient';
import ReviewModal from '@/components/ReviewModal';
import { Camera, CreditCard, CheckCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ChatRoomWrapper({ user, chat, reqRaw, initialMessages }: any) {
  const supabase = createSupabaseBrowserClient();
  const [status, setStatus] = useState(reqRaw?.status);
  const [showReview, setShowReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const req = reqRaw;
  const resRec = Array.isArray(req?.resources) ? req.resources[0] : req.resources;
  const requestTitle = resRec?.name ?? 'Resource';
  const requestCredits = req?.total_estimated_credits ?? 0;

  const isLender = user.id === req.lender_id;
  const isBorrower = user.id === req.borrower_id;
  const recipientId = isBorrower ? req.lender_id : req.borrower_id;

  // ✅ Auto open review modal for borrower only after completion
  useEffect(() => {
    if (status === 'completed' && isBorrower) {
      const timer = setTimeout(() => setShowReview(true), 600);
      return () => clearTimeout(timer);
    }
  }, [status, isBorrower]);

  // ✅ Real-time sync for request status (both sides)
  useEffect(() => {
    if (!req?.id) return;

    const channel = supabase
      .channel(`request-status-${req.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `id=eq.${req.id}`,
        },
        (payload: any) => {
          const newStatus = payload?.new?.status;
          if (newStatus && newStatus !== status) {
            setStatus(newStatus);
            setToast(
              newStatus === 'completed'
                ? '✅ Request Completed'
                : newStatus === 'canceled'
                ? '❌ Request Canceled'
                : null
            );
            if (newStatus && newStatus !== 'accepted')
              setTimeout(() => setToast(null), 2500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [req?.id, status, supabase]);

  // 🔹 Helper: POST to API route (cancel / complete)
  async function postAction(path: string, body: any, toastMsg: string) {
    setBusy(true);
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setBusy(false);

      if (data.success) {
        setToast(toastMsg);
        setTimeout(() => setToast(null), 3000);
      } else {
        console.error(data.error);
        setToast('⚠️ Action failed.');
        setTimeout(() => setToast(null), 3000);
      }

      return data;
    } catch (err) {
      console.error('Request action failed', err);
      setBusy(false);
      setToast('❌ Network error');
      setTimeout(() => setToast(null), 3000);
      return { error: 'Network error' };
    }
  }

  return (
    <div className="flex h-[calc(98vh-60px)] bg-slate-50 relative">
      {/* ✅ Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* LEFT CHAT */}
      <section className="flex-1 border-r border-slate-200 flex flex-col">
        <div className="px-6 py-6 border-l-stone-300">
          <h1 className="text-xl font-semibold text-slate-800 transition-colors">
            Chat with {isLender ? 'Borrower' : 'Lender'}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ChatRoomClient
            userId={user.id}
            chatId={chat.id}
            requestId={req.id}
            requestTitle={requestTitle}
            requestCredits={requestCredits}
            recipientId={recipientId}
            canTransfer={isBorrower}
            initialMessages={initialMessages}
          />
        </div>
      </section>

      {/* RIGHT SIDE */}
      <aside className="relative w-[340px] bg-white p-6 shadow-inner transition-colors duration-300">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          Request Details
        </h3>

        <div className="space-y-5 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Camera size={18} />
              <span>{requestTitle ? 'Item name' : 'Resource'}</span>
            </div>
            <span className="font-medium text-slate-900">{requestTitle}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <CreditCard size={18} />
              <span>Credits</span>
            </div>
            <span className="font-medium text-blue-700">{requestCredits}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle size={18} />
              <span>Status</span>
            </div>
            <span
              className={`font-medium transition-colors duration-500 ${
                status === 'completed'
                  ? 'text-green-600'
                  : status === 'canceled'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {status ?? 'Pending'}
            </span>
          </div>
        </div>

        {/* ✅ Action Buttons */}
        <div className="absolute bottom-8 left-6 right-6">
          {isLender && status === 'accepted' && (
            <button
              onClick={async () => {
                if (busy) return;
                const result = await postAction(
                  '/api/requests/complete',
                  { requestId: req.id },
                  '✅ Marked Complete!'
                );
                if (result?.success) setStatus('completed');
              }}
              className="w-full rounded-full bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 transition shadow-md disabled:opacity-60"
              disabled={busy}
            >
              {busy ? 'Please wait...' : 'Mark as Complete'}
            </button>
          )}

          {isBorrower && status !== 'completed' && status !== 'canceled' && (
            <button
              onClick={async () => {
                if (busy) return;
                const result = await postAction(
                  '/api/requests/cancel',
                  { requestId: req.id },
                  '❌ Request Canceled'
                );
                if (result?.success) setStatus('canceled');
              }}
              className="w-full rounded-full bg-red-500 py-2.5 font-medium text-white hover:bg-red-600 transition shadow-md disabled:opacity-60"
              disabled={busy}
            >
              {busy ? 'Please wait...' : 'Cancel Request'}
            </button>
          )}
        </div>

        {/* ✅ Auto Review Modal (borrower only) */}
        {showReview && isBorrower && (
          <ReviewModal
            resourceId={req.resource_id}
            requestId={req.id}
            revieweeId={req.lender_id}
            autoOpen={showReview}
          />
        )}
      </aside>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
