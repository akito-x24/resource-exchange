// 'use client';

// import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { UploadCloud } from 'lucide-react';
// import { useAppStore } from '@/store/useAppStore';

// const schema = z.object({
//   name: z.string().min(2, 'Name is too short'),
//   description: z.string().min(5, 'Description is too short'),
//   dailyRate: z.coerce.number().int().min(0),
//   imageUrl: z.string().url().optional(),
// });

// type FormValues = z.infer<typeof schema>;

// // Important: cast resolver to align RHF’s FieldValues with your FormValues
// const resolver: Resolver<FormValues> = zodResolver(schema) as unknown as Resolver<FormValues>;

// export function LendResourceModal({
//   open,
//   onOpenChange,
// }: {
//   open: boolean;
//   onOpenChange: (v: boolean) => void;
// }) {
//   const addResource = useAppStore((s) => s.addResource);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<FormValues>({
//     resolver,
//     defaultValues: { name: '', description: '', dailyRate: 0, imageUrl: '' },
//   });

//   const onSubmit: SubmitHandler<FormValues> = (values) => {
//     addResource({
//       name: values.name,
//       description: values.description,
//       dailyRate: values.dailyRate,
//       imageUrl:
//         values.imageUrl ||
//         'https://images.unsplash.com/photo-1526178610626-1b1c1f1b6b4a?q=80&w=1200&auto=format&fit=crop',
//     });
//     reset();
//     onOpenChange(false);
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
//       <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
//         <div className="flex items-center justify-between border-b px-6 py-4">
//           <h3 className="text-lg font-semibold">Add a New Resource</h3>
//           <button onClick={() => onOpenChange(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
//             ✕
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
//           <div>
//             <label className="block text-sm font-medium text-slate-700">Resource Name</label>
//             <input {...register('name')} className="mt-1 w-full rounded-lg border px-3 py-2 shadow-sm" placeholder="e.g., Electric Drill" />
//             {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700">Resource Image</label>
//             <div className="mt-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
//               <UploadCloud className="mx-auto mb-2 text-slate-400" />
//               <p className="text-sm text-slate-600">Paste an image URL (file upload later).</p>
//               <input {...register('imageUrl')} className="mt-3 w-full rounded-lg border px-3 py-2 shadow-sm" placeholder="https://..." />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700">Description</label>
//             <textarea {...register('description')} className="mt-1 w-full rounded-lg border px-3 py-2 shadow-sm" rows={4} />
//             {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700">Credit Rate</label>
//             <div className="mt-1 flex items-center gap-2">
//               <input type="number" {...register('dailyRate', { valueAsNumber: true })} className="w-28 rounded-lg border px-3 py-2 shadow-sm" />
//               <span className="text-sm text-slate-600">credits/day</span>
//             </div>
//             {errors.dailyRate && <p className="mt-1 text-sm text-red-600">{errors.dailyRate.message}</p>}
//           </div>

//           <div className="flex items-center justify-end gap-2 pt-2">
//             <button type="button" onClick={() => onOpenChange(false)} className="rounded-full border px-4 py-2 text-slate-700 hover:bg-slate-50">
//               Cancel
//             </button>
//             <button type="submit" className="rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
//               Save Resource
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }





// 'use client';

// import { createResourceAction } from '@/app/actions/resources';
// import { useState } from 'react';

// export function LendResourceModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
//   const [error, setError] = useState<string | null>(null);
//   if (!open) return null;

//   async function action(fd: FormData) {
//     const res = await createResourceAction(fd);
//     if ('error' in res) {
//       setError(res.error);
//       return;
//     }
//     onOpenChange(false);
//   }

'use client';
import { useState } from 'react';
import { createResourceAction } from '@/app/actions/resources';

export function LendResourceModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [error, setError] = useState<string | null>(null);
  if (!open) return null;

  async function action(fd: FormData) {
    setError(null);
    const res = await createResourceAction(fd);
    if ((res as any)?.error) {
      setError((res as any).error as string);
      return;
    }
    onOpenChange(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Add a New Resource</h3>
          <button onClick={() => onOpenChange(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">✕</button>
        </div>

        <form action={action} className="space-y-5 px-6 py-5">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700">Resource Name</label>
            <input name="name" required className="mt-1 w-full rounded-lg border px-3 py-2 shadow-sm" placeholder="e.g., Electric Drill" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Resource Image URL</label>
            <input name="imageUrl" className="mt-1 w-full rounded-lg border px-3 py-2 shadow-sm" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea name="description" rows={4} className="mt-1 w-full rounded-lg border px-3 py-2 shadow-sm" placeholder="Condition, features, etc." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Credit Rate</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="number" name="dailyRate" min={0} required className="w-28 rounded-lg border px-3 py-2 shadow-sm" />
              <span className="text-sm text-slate-600">credits/day</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full border px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">Save Resource</button>
          </div>
        </form>
      </div>
    </div>
  );
}