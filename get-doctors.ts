import { prisma } from './lib/prisma';

async function main() {
  const doctors = await prisma.doctor.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      pmdcNumber: true,
      specialization: true,
      city: true,
      isVerified: true,
      role: true,
      createdAt: true
    }
  });
  console.log(`=== TOTAL DOCTORS: ${doctors.length} ===\n`);
  console.log(JSON.stringify(doctors, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
