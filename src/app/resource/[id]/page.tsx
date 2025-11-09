import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createRequestAction } from '@/app/actions/requests';
import Image from 'next/image';
import { CreditCard, Star } from 'lucide-react';

type R = {
  id: string;
  name: string;
  description: string | null;
  daily_rate_credits: number;
  main_image_url: string | null;
  owner_id: string;
  profiles:
    | { username: string; avatar_url?: string }[]
    | { username: string; avatar_url?: string }
    | null;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer:
    | { username: string; avatar_url?: string }
    | { username: string; avatar_url?: string }[]
    | null;
};

export default async function ResourceDetails({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClient();

  const { data: resource } = await supabase
    .from('resources')
    .select(
      'id, name, description, daily_rate_credits, main_image_url, owner_id, profiles:owner_id(username, avatar_url)'
    )
    .eq('id', params.id)
    .single();

  const r = resource as R | null;
  if (!r)
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-slate-600">
        Resource not found.
      </div>
    );

  const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;

  // ✅ Fetch Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      'id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(username, avatar_url)'
    )
    .eq('resource_id', r.id)
    .order('created_at', { ascending: false });

  // ✅ Compute Average Rating
  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500 mb-6">
        <span className="font-medium text-slate-700">Resource Details</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* LEFT: Image */}
        <div>
          {r.main_image_url ? (
            <img
              src={r.main_image_url}
              alt={r.name}
              className="w-full h-[420px] rounded-2xl object-cover border border-slate-200 shadow-sm"
            />
          ) : (
            <div className="w-full h-[420px] flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl">
              No Image Available
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="space-y-6">
          {/* Title + Average Rating */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-extrabold text-slate-900">
                {r.name}
              </h1>
              {avgRating && (
                <div className="flex items-center gap-1 text-yellow-500 mt-2 sm:mt-0">
                  <Star size={18} className="fill-yellow-400" />
                  <span className="text-sm font-semibold text-slate-800">
                    {avgRating}/5
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    ({reviews?.length} reviews)
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 text-slate-600 leading-relaxed">
              {r.description || 'No description available for this resource.'}
            </p>
          </div>

          {/* Owner Info */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Owner</p>
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  width={60}
                  height={60}
                  className="rounded-full border border-slate-200"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 font-semibold">
                  {profile?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <p className="font-medium text-slate-800">
                  {profile?.username ?? 'Unknown User'}
                </p>
                <p className="text-xs text-slate-500">Available for exchange</p>
              </div>
            </div>
          </div>

          {/* Credit Rate */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Credit Rate
            </p>
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <CreditCard size={16} />
              <span>{r.daily_rate_credits} credits</span>
            </div>
          </div>

          {/* Request Form */}
          <form action={createRequestAction} className="pt-4">
            <input type="hidden" name="resourceId" value={r.id} />
            <input
              type="hidden"
              name="estimated"
              value={String(r.daily_rate_credits)}
            />
            <button className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold shadow hover:bg-blue-700 transition">
               Request this Resource
            </button>
          </form>
        </div>
      </div>

{/* ✅ Borrower Reviews Section */}
<div className="mt-16 border-t pt-8">
  <h2 className="text-xl font-bold text-slate-900 mb-6">
    Reviews & Ratings
  </h2>

  {reviews && reviews.length > 0 ? (
    <div className="space-y-6">
      {reviews.map((rev) => {
        const reviewer = Array.isArray(rev.reviewer)
          ? rev.reviewer[0]
          : rev.reviewer;

        return (
          <div
            key={rev.id}
            className="flex items-start gap-4 border-b border-slate-100 pb-5"
          >
            {/* Reviewer Avatar */}
            {reviewer?.avatar_url ? (
              <Image
                src={reviewer.avatar_url}
                alt={reviewer.username}
                width={50}
                height={50}
                className="rounded-full border border-slate-200"
              />
            ) : (
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold">
                {reviewer?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            {/* Review Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">
                  {reviewer?.username || 'Anonymous'}
                </p>
                <div className="text-yellow-400 text-2xl">
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                </div>
              </div>

              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                “{rev.comment}”
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(rev.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-slate-500 text-sm">No borrower reviews yet.</p>
  )}
</div>

    </div>
  );
}
