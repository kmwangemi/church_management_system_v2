import mongoose, { type Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: mongoose.Types.ObjectId[];
  isSystemRole: boolean; // True for built-in roles like 'member', 'pastor', etc.
  churchId?: mongoose.Types.ObjectId; // Optional for church-specific custom roles
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
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

// Compound index to ensure unique role names per church (or globally for system roles)
RoleSchema.index({ name: 1, churchId: 1 }, { unique: true });

export const Role =
  mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
