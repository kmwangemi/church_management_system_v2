import mongoose, { type Document, Schema } from 'mongoose';

export interface IBishop extends Document {
  userId: mongoose.Types.ObjectId;
  bishopId: string;
  appointmentDate: Date;
  jurisdictionArea: string;
  oversight: {
    branchIds: mongoose.Types.ObjectId[];
    pastorIds: mongoose.Types.ObjectId[];
  };
  qualifications: string[];
  achievements: string[];
  biography?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BishopSchema = new Schema<IBishop>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bishopId: { type: String, required: true, unique: true, trim: true },
    appointmentDate: { type: Date, required: true },
    jurisdictionArea: { type: String, required: true, trim: true },
    oversight: {
      branchIds: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
      pastorIds: [{ type: Schema.Types.ObjectId, ref: 'Pastor' }],
    },
    qualifications: [{ type: String, trim: true }],
    achievements: [{ type: String, trim: true }],
    biography: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Bishop ||
  mongoose.model<IBishop>('Bishop', BishopSchema);
