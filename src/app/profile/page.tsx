'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { signOutAction } from '@/app/actions/auth';
import Image from 'next/image';

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');
  const [contact, setContact] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [username, setUsername] = useState('');

  // Fetch profile on load
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio, contact_info')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || '');
        setBio(profileData.bio || '');
        setContact(profileData.contact_info || '');
        setAvatarUrl(profileData.avatar_url || null);
      }

      setLoading(false);
    })();
  }, [supabase]);

  async function handleSave() {
    if (!user) return;
    setMessage(null);
    setLoading(true);

    if (!username.trim()) {
      setMessage('❌ Username cannot be empty. ❌');
      setMessageType('error');
      setLoading(false);
      return;
    }

    let uploadedAvatarUrl = avatarUrl;

    // Upload new image if chosen
    if (avatarFile) {
      const filePath = `avatars/${user.id}-${Date.now()}-${avatarFile.name}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (error) {
        setMessage('❌ Failed to upload image. ❌');
        setMessageType('error');
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      uploadedAvatarUrl = publicUrl.publicUrl;
    }

    // Update profile info
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username,
        bio,
        contact_info: contact,
        avatar_url: uploadedAvatarUrl,
      })
      .eq('id', user.id);

    if (updateError) {
      setMessage('Failed to update profile.');
      setMessageType('error');
    } else {
      setMessage('Profile updated successfully!');
      setMessageType('success');
      setEditMode(false);
      setAvatarFile(null);
      setAvatarUrl(uploadedAvatarUrl);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center text-slate-600">
        Loading your profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center text-slate-700">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <h1 className="text-2xl font-semibold mb-6 text-slate-800 text-center">
        My Profile
      </h1>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={100}
            height={100}
            className="rounded-full border border-slate-200 shadow-sm object-cover"
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 text-2xl font-semibold">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        {editMode && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="mt-3 text-sm"
          />
        )}
      </div>

      {/* Info Section */}
      <div className="space-y-5">
        {/* Username */}
        <div>
          <p className="text-sm text-slate-500">Name</p>
          {editMode ? (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
            />
          ) : (
            <p className="font-medium text-slate-800">{username || user.email}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <p className="text-sm text-slate-500">Bio</p>
          {editMode ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Write something about yourself..."
            />
          ) : (
            <p className="text-slate-700">{bio || '—'}</p>
          )}
        </div>

        {/* Contact Info */}
        <div>
          <p className="text-sm text-slate-500">Contact Info</p>
          {editMode ? (
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Your email, phone, etc."
            />
          ) : (
            <p className="text-slate-700">{contact || '—'}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-3 flex-wrap">
        {!editMode ? (
          <>
            <button
              onClick={() => setEditMode(true)}
              className="rounded-full bg-blue-600 text-white px-6 py-2 font-medium hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>

            {/* Sign Out Button beside Edit */}
            <form action={signOutAction}>
  <button
    type="submit"
    className="rounded-full bg-red-500 text-white px-6 py-2 font-medium hover:bg-red-600 transition"
  >
    Sign Out
  </button>
</form>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-full bg-green-600 text-white px-6 py-2 font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setBio(profile?.bio || '');
                setContact(profile?.contact_info || '');
                setAvatarFile(null);
              }}
              className="rounded-full bg-slate-100 px-6 py-2 font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Message */}
      {message && (
        <p
          className={`text-center text-sm mt-4 font-medium ${
            messageType === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
