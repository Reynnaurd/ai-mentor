// ./apps/web/app/_components/AddStepForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

type Props = {
  projectId: string;
  nextOrder: number; // suggested next 1-based order
};

export default function AddStepForm({ projectId, nextOrder }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  // keep order as a string to avoid NaN jitter while the user edits
  const [order, setOrder] = useState<string>(String(nextOrder));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const t = title.trim();
    const d = detail.trim();
    const ord = Number(order);

    // client-side mirrors of DTO rules
    if (!t || !d) {
      setError('Title and detail are required.');
      return;
    }
    if (t.length > 120) {
      setError('Title must be 120 characters or fewer.');
      return;
    }
    if (!Number.isInteger(ord) || ord < 1) {
      setError('Order must be an integer >= 1.');
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/steps`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: t, detail: d, order: ord }),
      });

      if (!res.ok) {
        try {
          const data = await res.json();
          const code = data?.code as string | undefined;
          const msg =
            code === 'DUPLICATE_STEP_ORDER'
              ? 'That order is already used in this project. Pick another number.'
              : data?.message ||
                code ||
                `Request failed (${res.status} ${res.statusText})`;
          setError(msg);
        } catch {
          setError(`Request failed (${res.status} ${res.statusText})`);
        }
        setPending(false);
        return;
      }

      // success: clear fields, suggest next slot, refresh list
      setTitle('');
      setDetail('');
      setOrder(String(ord + 1));
      router.refresh();
      setPending(false);
    } catch (err) {
      setError((err as Error).message || 'Network error');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2">
        <label htmlFor="step-title" className="text-sm font-medium">
          Step title
        </label>
        <input
          id="step-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          disabled={pending}
          required
          maxLength={120}
          placeholder="e.g., Define requirements"
          className="border rounded-md px-3 py-2 outline-none focus:ring-2"
        />
        <div className="text-xs text-gray-500">{title.length}/120</div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="step-detail" className="text-sm font-medium">
          Detail
        </label>
        <textarea
          id="step-detail"
          value={detail}
          onChange={(e) => {
            setDetail(e.target.value);
            if (error) setError(null);
          }}
          disabled={pending}
          required
          placeholder="What exactly should be done?"
          className="border rounded-md px-3 py-2 min-h-[96px] outline-none focus:ring-2"
        />
      </div>

      <div className="grid gap-2 max-w-[200px]">
        <label htmlFor="step-order" className="text-sm font-medium">
          Order
        </label>
        <input
          id="step-order"
          type="number"
          min={1}
          step={1}
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            if (error) setError(null);
          }}
          disabled={pending}
          required
          className="border rounded-md px-3 py-2 outline-none focus:ring-2"
        />
        <p className="text-xs text-gray-500">
          Suggested: {nextOrder} (1-based, unique in project)
        </p>
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
        {pending ? 'Adding…' : 'Add Step'}
      </button>
    </form>
  );
}
