const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_zcfTG0Dp4nWm@ep-cool-union-ahqoafdf.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
  });

  await client.connect();

  const res = await client.query('SELECT id, email, role, "fullName", "pmdcNumber" FROM "Doctor"');
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
