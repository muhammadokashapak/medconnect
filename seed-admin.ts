import { prisma } from './lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  const email = 'adminokasha@gmail.com';
  const hashedPassword = await hash('12341234', 10);

  const existingAdmin = await prisma.doctor.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log("Admin already exists!");
    return;
  }

  const admin = await prisma.doctor.create({
    data: {
      fullName: 'System Admin',
      email: email,
      phoneNumber: '00000000000',
      pmdcNumber: 'pmdc11111111',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true
    }
  });

  console.log("Successfully created Admin:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
