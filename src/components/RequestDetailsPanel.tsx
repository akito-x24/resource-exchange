'use client';
import { useAppStore } from '@/store/useAppStore';
import { Camera, Coins, Calendar, Clock } from 'lucide-react';

export function RequestDetailsPanel({ requestId }: { requestId: string }) {
  const req = useAppStore(s => s.requests.find(r => r.id === requestId));
  const resource = useAppStore(s => s.resources.find(r => r.id === req?.resourceId));
  if (!req || !resource) return null;

  const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-50 text-slate-600">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:block lg:w-80">
      <div className="sticky top-24 space-y-3">
        <h3 className="px-1 text-lg font-semibold">Request Details</h3>
        <Row icon={<Camera size={18} />} label="Resource" value={resource.name} />
        <Row icon={<Coins size={18} />} label="Credits" value={`${req.estimatedCredits} credits`} />
        <Row icon={<Calendar size={18} />} label="Pickup Time" value="Tomorrow afternoon" />
        <Row icon={<Clock size={18} />} label="Status" value={req.status === 'accepted' ? 'In Progress' : req.status} />
      </div>
    </aside>
  );
}