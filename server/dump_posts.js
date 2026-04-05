const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const PostSchema = new mongoose.Schema({
  author_id: Number,
  content: String,
}, { strict: false });

const Post = mongoose.model('Post', PostSchema);

async function dump() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://root:root@127.0.0.1:28017/friendloop?authSource=admin';
    console.log(`Connecting to ${mongoURI}...`);
    await mongoose.connect(mongoURI);
    
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts:`);
    posts.forEach(p => {
      console.log(`- ID: ${p._id}, Author: ${p.author_id} (${typeof p.author_id}), Content: ${p.content}`);
    });
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

dump();
