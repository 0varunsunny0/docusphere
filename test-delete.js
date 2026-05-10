const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.document.delete({ where: { id: 'cm0omd4xl000060nrewth8slv' } });
    console.log('Success');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
main();
