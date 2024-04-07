import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  /*const org = await prisma.organizations.create({
    data: {
      id_organization: uuidv4(),
      name: `Acme Inc`,
      stripe_customer_id: `cust_stripe_acme_${uuidv4()}`,
    },
  });
  */
  const user = await prisma.users.create({
    data: {
      id_user: uuidv4(),
      email: 'audrey@aubry.io',
      password_hash: 'password_hashed_her',
      first_name: 'audrey',
      last_name: 'aubry',
      identification_strategy: 'b2c'
    },
  });

  // Seed the `projects` table with 10 projects
  const projectsData = Array.from({ length: 3 }).map((_, index) => ({
    id_project: uuidv4(),
    name: `Project ${index + 1}`,
    id_user: user.id_user,
    //id_organization: org.id_organization,
    sync_mode: 'pool',
  }));

  await prisma.projects.createMany({
    data: projectsData,
  });

  // Seed the `linked_users` table with 10 linked users
  /*const linkedUsersData = Array.from({ length: 10 }).map((_, index) => ({
    id_linked_user: uuidv4(),
    linked_user_origin_id: `acme_origin_id_${uuidv4()}`,
    alias: `Acme Inc`,
    id_project: projectsData[index % projectsData.length].id_project, // Circularly assign projects to linked users
  }));

  const linked_users = await prisma.linked_users.createMany({
    data: linkedUsersData,
  });

  const providers = [
    'hubspot',
    'zoho',
    'zendesk',
    'slack',
    'asana',
    'shopify',
    'pipedrive',
    'freshsales',
    'freshbooks',
    'sage',
  ];

  // Seed the `connections` table with 10 connections
  const connectionsData = linkedUsersData.map((user, index) => ({
    id_connection: uuidv4(),
    status: '2', // 2: RELINK NEEDED
    provider_slug: providers[index],
    id_linked_user: user.id_linked_user,
    id_project: user.id_project,
    token_type: 'oauth',
    created_at: new Date(),
  }));

  const connections = await prisma.connections.createMany({
    data: connectionsData,
  });

  const entitiesData = [
    {
      id_entity: uuidv4(),
      ressource_owner_id: 'contact',
    },
    {
      id_entity: uuidv4(),
      ressource_owner_id: 'task',
    },
    {
      id_entity: uuidv4(),
      ressource_owner_id: 'company',
    },
    {
      id_entity: uuidv4(),
      ressource_owner_id: 'note',
    },
  ];

  await prisma.entity.createMany({
    data: entitiesData,
  });

  const slugs = [
    {
      slug: 'fav_color',
      desc: 'favorite color',
      origin_field: 'favorite_color',
      providerSource: 'hubspot',
    },
    {
      slug: 'fav_coat',
      desc: 'favorite coat',
      origin_field: 'best_coat',
      providerSource: 'zoho',
    },
    {
      slug: 'sales_number',
      desc: 'number of sales',
      origin_field: 'sales_amount',
      providerSource: 'shopify',
    },
    {
      slug: 'pet_number',
      desc: 'number of pets',
      origin_field: 'pets_amount',
      providerSource: 'sage',
    },
  ];

  const attributesData = entitiesData.map((entity, index) => ({
    id_attribute: uuidv4(),
    status: 'mapped',
    ressource_owner_type: entity.ressource_owner_id,
    slug: slugs[index].slug,
    description: slugs[index].desc,
    data_type: `string`,
    remote_id: slugs[index].origin_field,
    source: slugs[index].providerSource,
    id_entity: entity.id_entity,
    scope: `user`,
  }));

  await prisma.attribute.createMany({
    data: attributesData,
  });

  const slugs_ = [
    {
      slug: 'fav_cake',
      desc: 'favorite cake',
      origin_field: 'favorite_cake',
      providerSource: 'hubspot',
    },
    {
      slug: 'fav_beanie',
      desc: 'favorite beanie',
      origin_field: 'best_beanie',
      providerSource: 'zoho',
    },
    {
      slug: 'clicks_number',
      desc: 'number of cliks',
      origin_field: 'clicks_amount',
      providerSource: 'shopify',
    },
    {
      slug: 'tv_number',
      desc: 'number of tv',
      origin_field: 'tv_amount',
      providerSource: 'sage',
    },
  ];

  const attributesData_ = entitiesData.map((entity, index) => ({
    id_attribute: uuidv4(),
    status: 'defined',
    ressource_owner_type: entity.ressource_owner_id,
    slug: slugs_[index].slug,
    description: slugs_[index].desc,
    data_type: `string`,
    remote_id: slugs_[index].origin_field,
    source: slugs_[index].providerSource,
    id_entity: entity.id_entity,
    scope: `user`,
  }));

  await prisma.attribute.createMany({
    data: attributesData_,
  });

  // Seed the `jobs` table with 20 jobs
  const jobsData = Array.from({ length: 10 }).map((_, index) => ({
    id_event: uuidv4(), // Generate a new UUID for each job
    status: 'initialized', // Use whatever status is appropriate
    type: 'pull',
    direction: '0',
    timestamp: new Date(),
    id_linked_user: linkedUsersData[index].id_linked_user,
  }));

  const jobs = await prisma.events.createMany({
    data: jobsData,
    skipDuplicates: true, // Set to true to ignore conflicts (optional)
  });

  /*const apiKeysData = Array.from({ length: 4 }).map((_, index) => ({
    id_api_key: uuidv4(),
    api_key_hash: `api_key_hashed_${index}`,
    id_project: 'e7a741ef-6b5c-46f8-b9a1-55667f3a6c61',
    id_user: 'd287cdda-28af-43a3-8d84-b5e22b584826',
  }));
  await prisma.api_keys.createMany({
    data: apiKeysData,
  });*/
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
