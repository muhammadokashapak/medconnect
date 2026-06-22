const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  client.query("SELECT table_schema, column_name FROM information_schema.columns WHERE table_name='Doctor'").then(r => {
    console.log(r.rows.map(x => x.column_name));
    process.exit(0);
  });
}).catch(console.error);
