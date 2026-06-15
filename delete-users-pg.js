const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();

  console.log("Connected. Fetching Admin...");
  const adminRes = await client.query(`SELECT * FROM "Doctor" WHERE role='ADMIN'`);
  const admin = adminRes.rows[0];

  if (!admin) {
    console.error("No admin found! Aborting!");
    process.exit(1);
  }

  console.log("Truncating Doctor table CASCADE...");
  await client.query(`TRUNCATE TABLE "Doctor" CASCADE;`);

  console.log("Re-inserting Admin...");
  // Re-inserting using parameterized query to avoid escaping issues
  const cols = Object.keys(admin);
  const values = Object.values(admin);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const insertQuery = `INSERT INTO "Doctor" ("${cols.join('", "')}") VALUES (${placeholders});`;
  
  await client.query(insertQuery, values);

  console.log("Admin re-inserted! Done!");

  await client.end();
}

main().catch(console.error);
