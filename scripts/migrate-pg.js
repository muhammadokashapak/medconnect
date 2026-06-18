const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const neonUrl = process.env.DATABASE_URL;
const xataUrl = "postgresql://xata:PkOZKTn9GlqV4C1azvOh3v0t7FoKzUIXsydJV5jItU8WopkBe2IHrOgyNVOfDC7f@ei4h8ejr9l38b3jnkd09cn3mpc.us-east-1.xata.tech/postgres?sslmode=require";

async function migrate() {
  const neonPool = new Pool({ connectionString: neonUrl, max: 5 });
  const xataPool = new Pool({ connectionString: xataUrl, max: 5 });

  try {
    console.log("Connecting to databases...");
    
    // Get all tables from Neon
    const tablesRes = await neonPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
    `);
    
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} tables to migrate.`);

    for (const table of tables) {
      console.log(`Migrating table: ${table}...`);
      
      const dataRes = await neonPool.query(`SELECT * FROM "${table}"`);
      const rows = dataRes.rows;
      
      if (rows.length === 0) {
        console.log(`  Skipping ${table}: 0 rows.`);
        continue;
      }

      // We need to disable foreign keys per transaction on Xata.
      const xataClient = await xataPool.connect();
      try {
        await xataClient.query("BEGIN");
        await xataClient.query("SET LOCAL session_replication_role = 'replica';");
        
        await xataClient.query(`TRUNCATE TABLE "${table}" CASCADE`);

        const columns = Object.keys(rows[0]);
        const columnsString = columns.map(c => `"${c}"`).join(', ');
        
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          
          let valuesStr = [];
          let params = [];
          let paramIndex = 1;

          for (const row of batch) {
            let rowValues = [];
            for (const col of columns) {
              rowValues.push(`$${paramIndex++}`);
              params.push(row[col]);
            }
            valuesStr.push(`(${rowValues.join(', ')})`);
          }

          const insertQuery = `INSERT INTO "${table}" (${columnsString}) VALUES ${valuesStr.join(', ')}`;
          await xataClient.query(insertQuery, params);
        }
        await xataClient.query("COMMIT");
      } catch (err) {
        await xataClient.query("ROLLBACK");
        throw err;
      } finally {
        xataClient.release();
      }
      
      console.log(`  Migrated ${rows.length} rows for ${table}.`);
    }

    console.log("Migration completed successfully!");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await neonPool.end();
    await xataPool.end();
  }
}

migrate();
