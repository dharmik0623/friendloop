import { pgPool } from '../../config/db';

const createTablesQuery = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  profile_picture_url TEXT,
  bio TEXT,
  age INTEGER,
  place VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

const createFriendshipsTableQuery = `
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  addressee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, addressee_id)
);
`;

export const initializePostgres = async () => {
    try {
        await pgPool.query(createTablesQuery);
        await pgPool.query(createFriendshipsTableQuery);
        
        // Add is_public to existing databases
        await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;');

        console.log('✅ PostgreSQL tables (users, friendships) initialized successfully with is_public');
    } catch (err) {
        console.error('❌ Error initializing PostgreSQL tables:', err);
    }
};
