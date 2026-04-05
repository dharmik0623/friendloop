import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient_id: number;
  sender_id: number;
  sender_name: string;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accept' | 'message';
  reference_id?: string;
  content?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient_id: { type: Number, required: true, index: true },
    sender_id: { type: Number, required: true },
    sender_name: { type: String, required: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['like', 'comment', 'friend_request', 'friend_accept', 'message'] 
    },
    reference_id: { type: String }, // e.g. postId, messageId
    content: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
