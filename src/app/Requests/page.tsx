import { createSupabaseServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  deleteBorrowPostAction,
  acceptBorrowPostAction,
} from '@/app/actions/borrowPosts';

type BorrowPost = {
  id: string;
  title: string;
  description: string;
  offered_credits: number;
  created_at: string;
  user_id: string;
  profiles:
    | { username: string; avatar_url?: string }[]
    | { username: string; avatar_url?: string }
    | null;
};

export default async function BorrowPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error } = await supabase
    .from('borrow_posts')
    .select(`
      id,
      title,
      description,
      offered_credits,
      created_at,
      user_id,
      profiles(username, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching borrow posts:', error.message);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 px-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-semibold text-slate-800">
          Borrow Requests
        </h2>
        <Link
          href="/Requests/new"
          className="rounded-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition"
        >
          New Request
        </Link>
      </div>

      {/* No posts */}
      {!posts || posts.length === 0 ? (
        <p className="text-slate-600 pt-6 text-center">
          No borrow requests yet.
        </p>
      ) : (
        posts.map((post: BorrowPost) => {
          const username =
            Array.isArray(post.profiles)
              ? post.profiles[0]?.username
              : (post.profiles as any)?.username;
          const avatar =
            Array.isArray(post.profiles)
              ? post.profiles[0]?.avatar_url
              : (post.profiles as any)?.avatar_url;
          const isOwner = user?.id === post.user_id;

          return (
            <div
              key={post.id}
              className="flex justify-between items-start border border-slate-200 bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition"
            >
              {/* LEFT SIDE — User + Post Details */}
              <div className="flex-1 pr-5">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      avatar ||
                      'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(username || 'U')
                    }
                    alt={username || 'User'}
                    className="h-10 w-10 rounded-full border border-slate-200"
                  />
                  <div>
                    <p className="font-medium text-slate-800">
                      {username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Posted on {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {post.description}
                  </p>
                </div>
              </div>

                {/* RIGHT SIDE — Credits + Button */}
                <div className="flex flex-col items-end min-w-[140px] text-right">
                  <div className="bg-slate-100 text-slate-700 rounded-xl px-8 py-3 text-sm font-medium mb-25">
                    💰 {post.offered_credits} credits
                  </div>

                  {isOwner ? (
                    <form
                      action={async (formData) => {
                        'use server';
                        await deleteBorrowPostAction(formData);
                      }}
                      className="w-full"
                    >
                      <input type="hidden" name="postId" value={post.id} />
                      <button className="w-full rounded-full bg-red-500 text-white text-sm px-4 py-2 hover:bg-red-600 transition">
                        Delete Request
                      </button>
                    </form>
                  ) : (
                    <form
                      action={async (formData) => {
                        'use server';
                        await acceptBorrowPostAction(formData);
                      }}
                      className="w-full"
                    >
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="borrowerId" value={post.user_id} />
                      <input
                        type="hidden"
                        name="offeredCredits"
                        value={post.offered_credits}
                      />
                      <button className="w-full rounded-full bg-green-600 text-white text-sm px-4 py-1.5 hover:bg-green-700 transition">
                        Accept Offer
                      </button>
                    </form>
                  )}
                </div>
            </div>
          );
        })
      )}
    </div>
  );
}
