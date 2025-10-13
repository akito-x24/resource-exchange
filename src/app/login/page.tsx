// // export default function LoginPage() {
// //   return (
// //     <div className="mx-auto mt-16 max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
// //       <h1 className="mb-4 text-2xl font-bold">Welcome Back</h1>
// //       <div className="space-y-3 text-left">
// //         <input className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm" placeholder="Email" />
// //         <input type="password" className="w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm" placeholder="Password" />
// //         <button className="w-full rounded-full bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700">Login (mock)</button>
// //       </div>
// //       <p className="mt-4 text-sm text-slate-500">Auth will be wired later.</p>
// //     </div>
// //   );
// // }


// import { signInAction, signUpAction } from '@/app/actions/auth';

// export default function LoginPage() {
//   return (
//     <div className="mx-auto mt-16 grid max-w-3xl gap-6 md:grid-cols-2">
//       <form action={signInAction} className="rounded-2xl border bg-white p-6">
//         <h2 className="mb-4 text-xl font-semibold">Login</h2>
//         <div className="space-y-3">
//           <input name="email" type="email" required className="w-full rounded-lg border px-3 py-2" placeholder="Email" />
//           <input name="password" type="password" required className="w-full rounded-lg border px-3 py-2" placeholder="Password" />
//           <button className="w-full rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Login</button>
//         </div>
//       </form>

//       <form action={signUpAction} className="rounded-2xl border bg-white p-6">
//         <h2 className="mb-4 text-xl font-semibold">Sign Up</h2>
//         <div className="space-y-3">
//           <input name="email" type="email" required className="w-full rounded-lg border px-3 py-2" placeholder="Email" />
//           <input name="password" type="password" required className="w-full rounded-lg border px-3 py-2" placeholder="Password" />
//           <button className="w-full rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Create account</button>
//         </div>
//       </form>
//     </div>
//   );
// }

import { signInAction, signUpAction } from '@/app/actions/auth';

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const err = searchParams?.error;
  return (
    <div className="mx-auto mt-16 grid max-w-3xl gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        {err && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">Error: {decodeURIComponent(err)}</div>}
      </div>

      <form action={signInAction} className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Login</h2>
        <div className="space-y-3">
          <input name="email" type="email" required className="w-full rounded-lg border px-3 py-2" placeholder="Email" />
          <input name="password" type="password" required className="w-full rounded-lg border px-3 py-2" placeholder="Password" />
          <button className="w-full rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Login</button>
        </div>
      </form>

      <form action={signUpAction} className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Sign Up</h2>
        <div className="space-y-3">
          <input name="email" type="email" required className="w-full rounded-lg border px-3 py-2" placeholder="Email" />
          <input name="password" type="password" required className="w-full rounded-lg border px-3 py-2" placeholder="Password" />
          <button className="w-full rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Create account</button>
        </div>
      </form>
    </div>
  );
}