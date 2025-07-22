import mongoose, { type Document, Schema } from 'mongoose';

export interface IPastor extends Document {
  churchId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  pastorId: string;
  ordinationDate?: Date;
  qualifications?: string[];
  specializations?: string[];
  assignments?: {
    branchId?: mongoose.Types.ObjectId;
    position?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }[];
  sermonCount?: number;
  counselingSessions?: number;
  biography?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PastorSchema = new Schema<IPastor>(
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
    pastorId: { type: String, required: true, unique: true, trim: true },
    ordinationDate: { type: Date },
    qualifications: [{ type: String, trim: true }],
    specializations: [{ type: String, trim: true }],
    assignments: [
      {
        branchId: {
          type: Schema.Types.ObjectId,
          ref: 'Branch',
        },
        position: { type: String, trim: true },
        startDate: { type: Date },
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
  }
);

export default mongoose.models.Pastor ||
  mongoose.model<IPastor>('Pastor', PastorSchema);
