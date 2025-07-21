import mongoose, { type Document, Schema } from 'mongoose';

export interface ISuperAdmin extends Document {
  userId: mongoose.Types.ObjectId;
  superAdminId: string;
  accessLevel: 'global'; // Always global for superadmin
  permissions: string[]; // All permissions
  systemSettings: {
    canCreateChurches: boolean;
    canDeleteChurches: boolean;
    canManageUsers: boolean;
    canAccessAnalytics: boolean;
    canManageSubscriptions: boolean;
    canAccessSystemLogs: boolean;
  };
  companyInfo?: {
    position?: string;
    department?: string;
    startDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema = new Schema<ISuperAdmin>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    superAdminId: { type: String, required: true, unique: true, trim: true },
    accessLevel: {
      type: String,
      enum: ['global'],
      default: 'global',
    },
    permissions: {
      type: [String],
      default: [
        'create_church',
        'delete_church',
        'manage_users',
        'access_analytics',
        'manage_subscriptions',
        'access_system_logs',
        'manage_system_settings',
        'view_all_data',
        'backup_restore',
        'manage_integrations',
      ],
    },
    systemSettings: {
      canCreateChurches: { type: Boolean, default: true },
      canDeleteChurches: { type: Boolean, default: true },
      canManageUsers: { type: Boolean, default: true },
      canAccessAnalytics: { type: Boolean, default: true },
      canManageSubscriptions: { type: Boolean, default: true },
      canAccessSystemLogs: { type: Boolean, default: true },
    },
    companyInfo: {
      position: { type: String, trim: true },
      department: { type: String, trim: true },
      startDate: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SuperAdmin ||
  mongoose.model<ISuperAdmin>('SuperAdmin', SuperAdminSchema);
