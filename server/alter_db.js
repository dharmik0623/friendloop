const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    database: process.env.POSTGRES_DB || 'friendloop',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: process.env.POSTGRES_PORT || 5432,
});

async function run() {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;');
        console.log('Added is_public column to users table.');

        await pool.query(`
            INSERT INTO users (id, username, email, password_hash, first_name, last_name, bio, profile_picture_url)
            VALUES (
                9999, 
                'spiderman', 
                'spidey@friendloop.com', 
                'fakehash123', 
                'Spiderman', 
                'AI', 
                'Friendly Neighborhood Spider-Bot!', 
                'https://upload.wikimedia.org/wikipedia/en/2/21/Web_of_Spider-Man_Vol_1_118-1.png'
            )
            ON CONFLICT (id) DO NOTHING;
        `);
        console.log('Seeded Spiderman AI user.');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
