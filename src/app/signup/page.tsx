import Link from 'next/link';
import { signUpAction } from '@/app/actions/auth';

export default function SignupPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const err = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : null;

  return (
    <div className="mx-auto mt-35 max-w-sm">
      <div className="rounded-2xl  bg-white p-10 shadow-sm">
        <h1 className="mb-1 text-3xl text-center font-bold">Create Account</h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Join our service now!
        </p>

        {err && (
          <div className="mb-4 rounded-md bg-red-50 p-5 text-sm text-red-700">
            Error: {err}
          </div> 
        )}

        <form action={signUpAction} className="space-y-5">
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border px-5 py-5"
            placeholder="Email"
          />
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border px-5 py-5"
            placeholder="Password (min 6 chars)"
          />
          <button className="w-full rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
