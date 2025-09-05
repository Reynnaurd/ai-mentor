// ./apps/web/app/project/[id]/page.tsx
import { api } from '../../../lib/api';
import Link from 'next/link';

type Step = { id: string; title: string; detail: string; order: number };
type Project = {
  id: string;
  title: string;
  description: string;
  steps: Step[];
};

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const awaitedParams = await params;
  const project = await api<Project>(`/projects/${awaitedParams.id}`);
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Link href="/" className="text-sm underline mb-4 inline-block">
        ← Back
      </Link>
      <h1 className="text-2xl font-semibold mb-1">{project.title}</h1>
      <p className="text-gray-600 mb-6">{project.description}</p>

      <h2 className="text-xl font-medium mb-3">Steps</h2>
      {project.steps.length === 0 ? (
        <p className="text-sm text-gray-500">No steps yet.</p>
      ) : (
        <ol className="space-y-2">
          {project.steps.map((s) => (
            <li key={s.id} className="border rounded-lg p-3">
              <div className="text-sm text-gray-500">#{s.order}</div>
              <div className="font-medium">{s.title}</div>
              <p className="text-sm text-gray-600">{s.detail}</p>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
