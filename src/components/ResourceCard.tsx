import Link from 'next/link';

type CardResource = {
  id: string;
  name: string;
  imageUrl: string;
  ownerName?: string;
  Rate: number;
};
export function ResourceCard({ r }: { r: CardResource }) {
  return (
  <Link
   href={`/resource/${r.id}`}
   className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
   <img src={r.imageUrl} className="h-44 w-full object-cover" alt={r.name} />
   <div className="space-y-1 p-4">
     <h3 className="text-base font-semibold text-slate-900">{r.name}</h3>
      {r.ownerName && <p className="text-sm text-slate-600">by {r.ownerName}</p>}
     <p className="text-sm font-medium text-blue-600">{r.Rate} credits</p>
   </div>
  </Link>
  );
}