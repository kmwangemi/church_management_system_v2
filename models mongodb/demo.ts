import mongoose, { type Document, Schema } from 'mongoose';

export interface IDemo extends Document {
  churchData: {
    churchName: string;
    denomination: string;
    churchSize: string;
    numberOfBranches: string;
    address: {
      country: string;
      address: string;
    };
  };
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    agreeToTerms: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    address: { type: String, required: true, trim: true, lowercase: true },
    country: { type: String, required: true, trim: true, lowercase: true },
  },
  { _id: false } // disables automatic _id for subdocument
);

const churchSchema = new Schema(
  {
    churchName: { type: String, required: true, trim: true, lowercase: true },
    denomination: { type: String, required: true, trim: true, lowercase: true },
    address: { type: AddressSchema, required: true },
    churchSize: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    numberOfBranches: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false } // disables automatic _id for subdocument
);

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, lowercase: true },
    lastName: { type: String, required: true, trim: true, lowercase: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    agreeToTerms: { type: Boolean, default: false },
  },
  { _id: false } // disables automatic _id for subdocument
);

const DemoSchema = new Schema<IDemo>(
  {
    churchData: { type: churchSchema, required: true },
    userData: { type: userSchema, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Demo ||
  mongoose.model<IDemo>('Demo', DemoSchema);
