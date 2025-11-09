'use client';

import { useState } from 'react';
import { createBorrowPostAction } from '@/app/actions/borrowPosts';
import { useRouter } from 'next/navigation';

export default function NewBorrowPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await createBorrowPostAction(form);

    if ((res as any)?.error) {
      setError((res as any).error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    // FIXED: redirect to the Requests listing (folder name is Requests)
    setTimeout(() => router.push('/Requests'), 1000);
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm px-4">
      <h1 className="text-2xl font-semibold mb-6 text-slate-800">
        Create Borrow Request
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            Request created successfully!
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            What do you need?
          </label>
          <input
            name="title"
            placeholder="e.g. I need a calculator for a day"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Describe your need..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Credits Offered
          </label>
          <input
            name="offered_credits"
            type="number"
            min="1"
            placeholder="Credits you offer"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-full font-medium hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {loading ? 'Posting...' : 'Post Request'}
        </button>
      </form>
    </div>
  );
}
