const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'friendloop',
});

async function query() {
  try {
    const res = await pool.query('SELECT id, username, email FROM users LIMIT 5');
    console.log(`Found ${res.rows.length} users:`);
    res.rows.forEach(u => {
      console.log(`- ID: ${u.id}, Username: ${u.username}, Email: ${u.email}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

query();
