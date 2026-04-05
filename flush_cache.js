const { createClient } = require('redis');

async function flush() {
  const client = createClient({ url: 'redis://localhost:6379' });
  await client.connect();
  await client.flushAll();
  console.log('Redis flushed');
  await client.quit();
}

flush().catch(console.error);
