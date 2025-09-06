// ./apps/web/app/project/[id]/page.tsx
import { api } from '@/lib/api';
import Link from 'next/link';
import AddStepForm from '@/app/_components/AddStepForm';

type Step = { id: string; title: string; detail: string; order: number };
type Project = {
  id: string;
  title: string;
  description: string;
  steps: Step[];
};

// Always fetch fresh so router.refresh() reflects new steps immediately
export const revalidate = 0;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // using your preferred awaited-params pattern to avoid warnings
  const { id } = await params;
  const project = await api<Project>(`/projects/${id}`);

  const nextOrder = (project.steps.at(-1)?.order ?? 0) + 1;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Link href="/" className="text-sm underline mb-4 inline-block">
        ← Back
      </Link>

      <h1 className="text-2xl font-semibold mb-1">{project.title}</h1>
      <p className="text-gray-600 mb-6">{project.description}</p>

      {/* Add Step */}
      <section className="mb-8 border rounded-lg p-4">
        <h2 className="text-lg font-medium mb-3">Add a step</h2>
        <AddStepForm projectId={project.id} nextOrder={nextOrder} />
      </section>

      {/* Steps list */}
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
