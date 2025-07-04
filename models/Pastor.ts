import mongoose, { type Document, Schema } from 'mongoose';

export interface IPastor extends Document {
  userId: mongoose.Types.ObjectId;
  pastorId: string;
  ordinationDate: Date;
  qualifications: string[];
  specializations: string[];
  assignments: {
    branchId: mongoose.Types.ObjectId;
    position: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
  }[];
  sermonCount: number;
  counselingSessions: number;
  biography?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PastorSchema = new Schema<IPastor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    pastorId: { type: String, required: true, unique: true, trim: true },
    ordinationDate: { type: Date, required: true },
    qualifications: [{ type: String, trim: true }],
    specializations: [{ type: String, trim: true }],
    assignments: [
      {
        branchId: {
          type: Schema.Types.ObjectId,
          ref: 'Branch',
          required: true,
        },
        position: { type: String, required: true, trim: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true },
      },
    ],
    sermonCount: { type: Number, default: 0 },
    counselingSessions: { type: Number, default: 0 },
    biography: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Pastor ||
  mongoose.model<IPastor>('Pastor', PastorSchema);
