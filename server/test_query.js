require('dotenv').config();
const { Pool } = require('pg');

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/friendloop'
});

async function run() {
  try {
    const ids = [1];
    
    // Test 1: ANY($1)
    const r1 = await pgPool.query('SELECT id, username FROM users WHERE id = ANY($1)', [ids]);
    console.log('Result ANY($1):', r1.rows);

    // Test 2: ANY($1::int[])
    const r2 = await pgPool.query('SELECT id, username FROM users WHERE id = ANY($1::int[])', [ids]);
    console.log('Result ANY($1::int[]):', r2.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pgPool.end();
  }
}

run();
