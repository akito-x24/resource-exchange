'use client';
import { useState } from 'react';
import { createResourceAction } from '@/app/actions/resources';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function LendResourceModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  if (!open) return null;

  // Handle form submission
  async function action(fd: FormData) {
    setError(null);

    // Append uploaded image URL
    if (imageUrl) fd.append('main_image_url', imageUrl);

    const res = await createResourceAction(fd);
    if ((res as any)?.error) {
      setError((res as any).error as string);
      return;
    }
    onOpenChange(false);
  }

  // Upload image to Supabase Storage
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `images/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('resources')
      .upload(filePath, file);

    if (error) {
      setError('Failed to upload image.');
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    setImageUrl(publicUrl.publicUrl);
    setUploading(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Add a New Resource</h3>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form action={action} className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Resource Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Resource Name
            </label>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-lg border px-3 py-2 shadow-sm"
              placeholder="e.g., Electric Drill"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full border px-3 py-2 rounded-lg"
            />
            {uploading && (
              <p className="text-xs text-slate-500 mt-1">Uploading...</p>
            )}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Uploaded Preview"
                className="mt-3 h-40 w-full object-cover rounded-lg"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              className="mt-1 w-full rounded-lg border px-3 py-2 shadow-sm"
              placeholder="Condition, features, etc."
            />
          </div>

          {/* Credit Rate */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Credit Rate
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                name="daily_rate_credits"
                min={0}
                required
                className="w-28 rounded-lg border px-3 py-2 shadow-sm"
              />
              <span className="text-sm text-slate-600">credits</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
