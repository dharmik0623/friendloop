import { pgPool } from './config/db';

const migrate = async () => {
    try {
        console.log('🚀 Starting migration...');
        
        // Add age column if it doesn't exist
        await pgPool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='age') THEN
                    ALTER TABLE users ADD COLUMN age INTEGER;
                END IF;
            END $$;
        `);
        console.log('✅ Added age column (if it didn\'t exist)');

        // Add place column if it doesn't exist
        await pgPool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='place') THEN
                    ALTER TABLE users ADD COLUMN place VARCHAR(100);
                END IF;
            END $$;
        `);
        console.log('✅ Added place column (if it didn\'t exist)');

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};

migrate();
