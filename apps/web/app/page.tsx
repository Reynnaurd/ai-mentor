// apps/web/app/page.tsx
import Link from 'next/link';
import { api } from '../lib/api';

type Project = { id: string; title: string; description: string };

export default async function Home() {
  const projects = await api<Project[]>('/projects');
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>
      {projects.length === 0 ? (
        <p className="text-sm text-gray-500">No projects yet.</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.id} className="border rounded-lg p-3">
              <Link className="underline" href={`/project/${p.id}`}>
                {p.title}
              </Link>
              <p className="text-sm text-gray-500">{p.description}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
