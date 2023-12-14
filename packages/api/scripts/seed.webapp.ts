import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organizations.create({
    data: {
      id_organization: uuidv4(),
      name: `Acme Inc`,
      stripe_customer_id: `cust_stripe_acme_${uuidv4()}`,
    },
  });

  await prisma.users.create({
    data: {
      id_user: uuidv4(),
      email: 'audrey@aubry.io',
      password_hash: 'password_hashed_her',
      first_name: 'audrey',
      last_name: 'aubry',
    },
  });

  // Seed the `projects` table with 10 projects
  const projectsData = Array.from({ length: 3 }).map((_, index) => ({
    id_project: uuidv4(),
    name: `Project ${index + 1}`,
    id_organization: org.id_organization,
    sync_mode: 'pool',
  }));

  await prisma.projects.createMany({
    data: projectsData,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
