import mongoose, { type Document, Schema } from 'mongoose';

// Permission Model
export interface IPermission extends Document {
  name: string;
  description: string;
  module: string; // e.g., 'users', 'churches', 'members', 'analytics'
  action: string; // e.g., 'create', 'read', 'update', 'delete', 'manage'
  resource?: string; // Optional specific resource
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    resource: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Permission =
  mongoose.models.Permission ||
  mongoose.model<IPermission>('Permission', PermissionSchema);
