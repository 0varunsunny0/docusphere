import { prisma } from './src/lib/prisma';

async function main() {
  try {
    // Create a dummy user
    const user = await prisma.user.create({
      data: { email: 'testfk@test.com', password: 'abc', name: 'Test' }
    });
    // Create a dummy document
    const doc = await prisma.document.create({
      data: { id: 'test-doc-123', title: 'Test', ownerId: user.id }
    });
    // Create an analytics event tied to it
    await prisma.analytics.create({
      data: { userId: user.id, documentId: doc.id, eventName: 'document.open', metadata: {} }
    });
    
    // Now try to delete the document!
    await prisma.document.delete({ where: { id: doc.id } });
    console.log('SUCCESS: Deletion worked!');
  } catch (e) {
    console.error('ERROR:', e);
  }
}
main();
