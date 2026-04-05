import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversation_id: string; // E.g., "1_2" where 1 and 2 are user IDs (sorted)
  sender_id: number; // References PostgreSQL user ID
  receiver_id: number; // References PostgreSQL user ID
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversation_id: { type: String, required: true, index: true },
    sender_id: { type: Number, required: true },
    receiver_id: { type: Number, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
