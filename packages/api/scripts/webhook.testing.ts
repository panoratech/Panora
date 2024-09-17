import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  /*const webhook_endpoint = await prisma.webhook_endpoints.create({
    data: {
      id_webhook_endpoint: uuidv4(),
      url: 'https://webhook.site/5018c5f3-e582-4f6f-a5ca-9e7389e951e2',
      secret: '12345679',
      active: true,
      created_at: new Date(),
      id_project: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
      scope: 'crm.contact.synced',
    },
  });*/
  await prisma.webhook_endpoints.update({
    where: {
      id_webhook_endpoint: 'a18682af-43f6-4ed2-8bde-b84298f51dde',
    },
    data: {
      scope: ['crm.contact.pulled'],
    },
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
