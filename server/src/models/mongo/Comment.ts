import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  post_id: mongoose.Types.ObjectId; // References MongoDB Post ID
  author_id: number; // References PostgreSQL user ID
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author_id: { type: Number, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>('Comment', CommentSchema);
