// 'use client';
// import { useEffect, useState, useTransition } from 'react';
// import { submitReviewAction } from '@/app/actions/reviews';

// interface ReviewModalProps {
//   resourceId: string;
//   requestId: string;
//   revieweeId: string;
//   autoOpen?: boolean; // ✅ optional prop for automatic modal open
// }

// export default function ReviewModal({
//   resourceId,
//   requestId,
//   revieweeId,
//   autoOpen = false,
// }: ReviewModalProps) {
//   const [open, setOpen] = useState(autoOpen);
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState('');
//   const [isPending, startTransition] = useTransition();
//   const [msg, setMsg] = useState<string | null>(null);

//   // ✅ Automatically open modal when autoOpen becomes true
//   useEffect(() => {
//     if (autoOpen) {
//       setOpen(true);
//     }
//   }, [autoOpen]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!rating) return setMsg('Please give a rating ⭐');
//     startTransition(async () => {
//       const formData = new FormData();
//       formData.append('rating', rating.toString());
//       formData.append('comment', comment);
//       formData.append('resourceId', resourceId);
//       formData.append('requestId', requestId);
//       formData.append('revieweeId', revieweeId);

//       const res = await submitReviewAction(formData);

//       if ((res as any).error) {
//         setMsg((res as any).error);
//       } else {
//         setMsg('✅ Review submitted successfully!');
//         setTimeout(() => {
//           setMsg(null);
//           setOpen(false);
//           setRating(0);
//           setComment('');
//         }, 1200);
//       }
//     });
//   };

//   return (
//     <>
//       {!autoOpen && (
//         <button
//           onClick={() => setOpen(true)}
//           className="rounded-full bg-blue-600 text-white px-5 py-2 text-sm hover:bg-blue-700 transition"
//         >
//           Leave a Review
//         </button>
//       )}

//       {open && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-[360px] shadow-lg animate-fadeIn">
//             <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
//               Leave a Review
//             </h3>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* ⭐ Rating */}
//               <div className="flex justify-center gap-1">
//                 {[1, 2, 3, 4, 5].map((n) => (
//                   <button
//                     key={n}
//                     type="button"
//                     onClick={() => setRating(n)}
//                     className={`text-2xl ${
//                       n <= rating ? 'text-yellow-400' : 'text-slate-400'
//                     } hover:scale-110 transition`}
//                   >
//                     ★
//                   </button>
//                 ))}
//               </div>

//               {/* 💬 Comment */}
//               <textarea
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 placeholder="Write your review..."
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
//                 rows={3}
//               />

//               {/* Buttons */}
//               <div className="flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setOpen(false)}
//                   className="text-slate-600 text-sm hover:underline"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isPending}
//                   className="rounded-full bg-blue-600 text-white px-4 py-1.5 text-sm hover:bg-blue-700 transition disabled:opacity-50"
//                 >
//                   {isPending ? 'Submitting...' : 'Submit'}
//                 </button>
//               </div>
//             </form>

//             {msg && (
//               <p className="mt-3 text-center text-sm text-green-600">{msg}</p>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


'use client';
import { useEffect, useState, useTransition } from 'react';
import { submitReviewAction } from '@/app/actions/reviews';

// ✅ Simple toast component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 bg-green-500 text-white text-sm px-4 py-2 rounded-lg shadow-md animate-fadeIn">
      {message}
    </div>
  );
}

interface ReviewModalProps {
  resourceId: string;
  requestId: string;
  revieweeId: string;
  autoOpen?: boolean; // Auto open when transaction completes
  onClose?: () => void; // Optional callback for parent component
}

export default function ReviewModal({
  resourceId,
  requestId,
  revieweeId,
  autoOpen = false,
  onClose,
}: ReviewModalProps) {
  const [open, setOpen] = useState(autoOpen);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Automatically open when triggered
  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setMsg('Please select a rating ⭐');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('rating', rating.toString());
      formData.append('comment', comment);
      formData.append('resourceId', resourceId);
      formData.append('requestId', requestId);
      formData.append('revieweeId', revieweeId);

      const res = await submitReviewAction(formData);

      if ((res as any).error) {
        setMsg((res as any).error);
      } else {
        setMsg('Review submitted successfully!');
        setToast('Thank you for your review!');
        setTimeout(() => {
          setMsg(null);
          setOpen(false);
          onClose?.();
          setRating(0);
          setComment('');
        }, 1200);
      }
    });
  };

  return (
    <>
      {!autoOpen && (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-full bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition shadow-md"
        >
          Leave a Review
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl w-[380px] shadow-2xl border border-slate-200">
            <h3 className="text-xl font-semibold mb-3 text-slate-800 text-center">
              Leave a Review ⭐
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`text-3xl ${
                      n <= rating ? 'text-yellow-400' : 'text-slate-300'
                    } hover:scale-110 transition`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your experience..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                rows={3}
              />

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onClose?.();
                  }}
                  className="text-slate-600 text-sm hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-blue-600 text-white px-4 py-1.5 text-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>

              {msg && (
                <p className="mt-2 text-sm text-center text-green-600">{msg}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
