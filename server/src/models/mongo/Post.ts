import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  author_id: number; // References PostgreSQL user ID
  content: string;
  images: string[];
  videos: string[];
  likes: number[]; // Array of PostgreSQL user IDs who liked the post
  bookmarks: number[]; // Array of user IDs who bookmarked the post
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    author_id: { type: Number, required: true, index: true },
    content: { type: String, required: false },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    likes: { type: [Number], default: [] },
    bookmarks: { type: [Number], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', PostSchema);
