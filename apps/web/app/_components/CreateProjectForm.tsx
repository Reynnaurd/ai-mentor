'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function CreateProjectForm() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // basic client validation that mirrors DTOs
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      setError('Title and description are required.');
      return;
    }
    if (t.length > 120) {
      setError('Title must be 120 characters or fewer.');
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: t, description: d }),
      });

      if (!res.ok) {
        try {
          const data = await res.json();
          const msg =
            data?.message ||
            data?.code ||
            `Request failed (${res.status} ${res.statusText})`;
          setError(msg);
        } catch {
          setError(`Request failed (${res.status} ${res.statusText})`);
        }
        setPending(false);
        return;
      }

      const proj: { id: string } = await res.json();
      router.push(`/project/${proj.id}`);
    } catch (err) {
      setError((err as Error).message || 'Network error');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={pending}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2"
          placeholder="e.g., AI Blueprint Mentor"
        />
        <div className="text-xs text-gray-500">{title.length}/120</div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={pending}
          placeholder="What is this project about?"
          className="border rounded-md px-3 py-2 min-h-[96px] outline-none focus:ring-2"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg px-4 py-2 border bg-black text-white disabled:opacity-60"
      >
        {pending ? 'Creating…' : 'Create Project'}
      </button>
    </form>
  );
}
