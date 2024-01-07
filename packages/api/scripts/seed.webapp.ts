import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organizations.create({
    data: {
      id_organization: `55222419-795d-4183-8478-361626363e58`,
      name: `Acme Inc`,
      stripe_customer_id: `cust_stripe_acme_56604f75-7bf8-4541-9ab4-5928aade4bb8`,
    },
  });

  await prisma.users.create({
    data: {
      id_user: `0ce39030-2901-4c56-8db0-5e326182ec6b`,
      email: 'audrey@aubry.io',
      password_hash:
        '$2b$10$Nxcp3x0yDaCrMrhZQ6IiNeqk0BxxDTnfn9iGG2UK5nWMh/UB6LgZu',
      first_name: 'audrey',
      last_name: 'aubry',
      id_organization: '55222419-795d-4183-8478-361626363e58',
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
