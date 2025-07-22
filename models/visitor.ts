import mongoose, { type Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
  churchId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  visitorId: string;
  visitDate?: Date;
  invitedBy?: mongoose.Types.ObjectId;
  howDidYouHear?: 'friend' | 'family' | 'online' | 'flyer' | 'other';
  followUpStatus: 'pending' | 'contacted' | 'interested' | 'not_interested';
  followUpDate?: Date;
  followUpNotes?: string;
  interestedInMembership: boolean;
  servicesAttended?: string[];
  occupation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    visitorId: { type: String, required: true, unique: true, trim: true },
    visitDate: { type: Date, default: Date.now },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    howDidYouHear: {
      type: String,
      enum: ['friend', 'family', 'online', 'flyer', 'other'],
      required: true,
      default: 'other',
    },
    followUpStatus: {
      type: String,
      enum: ['pending', 'contacted', 'interested', 'not_interested'],
      default: 'pending',
    },
    followUpDate: { type: Date },
    followUpNotes: { type: String, trim: true },
    interestedInMembership: { type: Boolean, default: false },
    servicesAttended: [{ type: String, trim: true }],
    occupation: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Visitor ||
  mongoose.model<IVisitor>('Visitor', VisitorSchema);
