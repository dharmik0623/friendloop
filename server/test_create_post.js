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
    
    console.log(`Testing createPost for user ${user.id} (${user.username})`);
    
    const formData = new FormData();
    formData.append('content', 'Testing create post from script!');

    const response = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      // FormData will automatically set the Content-Type with boundary
      body: formData
    });
    
    const post = await response.json();
    console.log(`Created Post Response:`, JSON.stringify(post));
  } catch (err) {
    console.error(err);
  } finally {
    await pgPool.end();
  }
}

test();
