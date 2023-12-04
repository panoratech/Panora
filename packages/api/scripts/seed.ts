import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Seed the `organizations` table with 5 organizations
  /*const organizationsData = Array.from({ length: 5 }).map((_, index) => ({
    id_organization: uuidv4(),
    name: `Organization ${index + 1}`,
    stripe_customer_id: `cust_${index + 1}`,
  }));

  await prisma.organizations.createMany({
    data: organizationsData,
  });

  // Seed the `projects` table with 10 projects
  const projectsData = organizationsData.map((org, index) => ({
    id_project: uuidv4(),
    name: `Project ${index + 1}`,
    id_organization: org.id_organization,
  }));

  await prisma.projects.createMany({
    data: projectsData,
  });*/

  // Seed the `linked_users` table with 20 linked users
  /*const linkedUsersData = Array.from({ length: 20 }).map((_, index) => ({
    id_linked_user: uuidv4(),
    linked_user_origin_id: `origin_id_${index + 1}`,
    alias: `Alias ${index + 1}`,
    id_project: projectsData[index % projectsData.length].id_project, // Circularly assign projects to linked users
  }));

  await prisma.linked_users.createMany({
    data: linkedUsersData,
  });

  // Seed the `connections` table with 15 connections
  const connectionsData = linkedUsersData.map((user, index) => ({
    id_connection: uuidv4(),
    status: 'active',
    provider_slug: `hubspot`,
    id_linked_user: user.id_linked_user,
    id_project: user.id_project,
    token_type: 'oauth',
    created_at: new Date(),
  }));

  await prisma.connections.createMany({
    data: connectionsData,
  });

  // Seed the `attributes` and `entities` table
  const entitiesData = Array.from({ length: 10 }).map((_, index) => ({
    id_entity: uuidv4(),
    ressource_owner_id: `resource_owner_${index + 1}`,
  }));

  await prisma.entity.createMany({
    data: entitiesData,
  });

  const attributesData = entitiesData.map((entity, index) => ({
    id_attribute: uuidv4(),
    status: 'mapped',
    ressource_owner_type: `type_${index + 1}`,
    slug: `slug_${index + 1}`,
    description: `Description for attribute ${index + 1}`,
    data_type: `string`,
    remote_id: `remote_id_${index + 1}`,
    source: `source_${index + 1}`,
    id_entity: entity.id_entity,
    scope: `scope_${index + 1}`,
  }));

  await prisma.attribute.createMany({
    data: attributesData,
  });*/

  // Seed the `jobs` table with 20 jobs
  const jobsData = Array.from({ length: 20 }).map((_, index) => ({
    id_job: uuidv4(), // Generate a new UUID for each job
    status: 'active', // Use whatever status is appropriate
    timestamp: new Date(),
    // Replace with an actual linked user ID from your `linked_users` table
    id_linked_user: 'ff427999-c87b-44f8-92ec-ed75b834a0cf',
    // Add other fields as required
  }));

  const jobs = await prisma.jobs.createMany({
    data: jobsData,
    skipDuplicates: true, // Set to true to ignore conflicts (optional)
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
