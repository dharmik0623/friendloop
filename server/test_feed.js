require('dotenv').config();
const { signToken } = require('./dist/utils/jwt');
const { pgPool } = require('./dist/config/db');

async function test() {
  try {
    const res = await pgPool.query('SELECT id, username FROM users LIMIT 1');
    if (res.rows.length === 0) {
      console.log('No users found');
      return;
    }
    const user = res.rows[0];
    const token = signToken(user.id);
    
    console.log(`Testing feed for user ${user.id} (${user.username})`);
    
    // Using node 18+ native fetch
    const response = await fetch('http://localhost:5000/api/posts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const feed = await response.json();
    console.log(`Feed has ${feed.length} posts`);
    if (feed.length > 0) {
      for (let i = 0; i < Math.min(3, feed.length); i++) {
        const post = feed[i];
        console.log(`Post ${post._id} Author:`, JSON.stringify(post.author));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pgPool.end();
  }
}

test();
