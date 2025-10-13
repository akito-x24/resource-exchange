import Link from 'next/link';
import type { Resource } from '@/types';

export function ResourceCard({ r }: { r: Resource }) {
  return (
    <Link href={`/resource/${r.id}`} className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <img src={r.imageUrl} className="h-44 w-full object-cover" alt="" />
      <div className="space-y-1 p-4">
        <h3 className="text-base font-semibold text-slate-900">{r.name}</h3>
        <p className="text-sm text-slate-600">by {r.ownerName}</p>
        <p className="text-sm font-medium text-blue-600 hover:underline">{r.dailyRate} credits/day</p>
      </div>
    </Link>
  );
}