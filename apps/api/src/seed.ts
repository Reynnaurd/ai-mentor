import 'reflect-metadata';
import dataSource from './config/data-source';
import { Project } from './project/project.entity';
import { Step } from './step/step.entity';

async function main() {
  await dataSource.initialize();
  const projects = dataSource.getRepository(Project);
  const steps = dataSource.getRepository(Step);

  const title = 'Demo Project';
  const description = 'Seeded project with 3 steps';

  // 1) Find or create the project
  let project = await projects.findOne({ where: { title } });
  if (!project) {
    project = projects.create({ title, description });
    project = await projects.save(project);
    console.log('Created project:', project.id);
  } else {
    console.log('Project exists:', project.id);
  }

  // 2) If the project has no steps, insert 3 in order
  const count = await steps.count({ where: { project: { id: project.id } } });
  if (count === 0) {
    const payload = [
      {
        title: 'Define requirements',
        detail: 'Write a concise project brief.',
        order: 1,
      },
      {
        title: 'Set up repository',
        detail: 'Initialize monorepo, devcontainer, Docker.',
        order: 2,
      },
      {
        title: 'Create initial API',
        detail: 'Projects/Steps CRUD with migrations.',
        order: 3,
      },
    ].map((s) => steps.create({ ...s, project: { id: project.id } }));

    await steps.save(payload);
    console.log('Inserted 3 steps for project:', project.id);
  } else {
    console.log('Steps already present:', count);
  }
}

main()
  .then(() => dataSource.destroy())
  .catch(async (e) => {
    console.error(e);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  });
