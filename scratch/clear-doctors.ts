import { prisma } from '../lib/prisma';

async function main() {
  const result = await prisma.doctor.deleteMany({
    where: {
      role: {
        not: 'ADMIN'
      }
    }
  });
  console.log("Deleted doctors count:", result.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
