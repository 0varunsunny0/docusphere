import { prisma } from './src/lib/prisma';

async function main() {
  const doc = await prisma.document.create({
    data: {
      id: 'test-delete-123',
      title: 'Test',
      ownerId: '123' // we need a valid user id, let's grab one
    }
  });
  console.log(doc);
}
main();
