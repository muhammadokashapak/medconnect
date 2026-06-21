const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set in environment!");
    process.exit(1);
  }

  console.log("Initializing database connection...");
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Updating all existing doctors to status VERIFIED...");
  const updateResult = await prisma.doctor.updateMany({
    data: {
      verificationStatus: "VERIFIED",
      isVerified: true
    }
  });
  console.log(`Successfully updated ${updateResult.count} users in the database.`);
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
