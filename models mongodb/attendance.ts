import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for an individual attendance record
export interface IAttendanceRecord {
  userId: mongoose.Types.ObjectId;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'present' | 'late' | 'absent' | 'excused';
  notes?: string;
}

// Define the interface for an Attendance document
export interface IAttendance extends Document {
  churchId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  serviceScheduleId: mongoose.Types.ObjectId;
  attendanceDate: Date;
  totalExpected?: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalExcused: number;
  attendancePercentage: number;
  records: IAttendanceRecord[];
  takenBy: mongoose.Types.ObjectId; // User who recorded the attendance
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  remarks?: string;
  weatherConditions?: string;
  specialEvents?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendanceModel extends Model<IAttendance> {
  // Example static methods:
  // findByServiceSchedule(serviceScheduleId: string): Promise<IAttendance[]>;
  // getAttendanceStats(churchId: string, startDate: Date, endDate: Date): Promise<any>;
  // calculateAverageAttendance(serviceScheduleId: string): Promise<number>;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['present', 'late', 'absent', 'excused'],
      default: 'present',
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes must be less than 200 characters'],
    },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    serviceScheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceSchedule',
      required: true,
    },
    attendanceDate: {
      type: Date,
      required: true,
      index: true,
    },
    totalExpected: {
      type: Number,
      min: [0, 'Total expected cannot be negative'],
      max: [10_000, 'Total expected seems too high'],
    },
    totalPresent: {
      type: Number,
      required: true,
      min: [0, 'Total present cannot be negative'],
      default: 0,
    },
    totalLate: {
      type: Number,
      required: true,
      min: [0, 'Total late cannot be negative'],
      default: 0,
    },
    totalAbsent: {
      type: Number,
      required: true,
      min: [0, 'Total absent cannot be negative'],
      default: 0,
    },
    totalExcused: {
      type: Number,
      required: true,
      min: [0, 'Total excused cannot be negative'],
      default: 0,
    },
    attendancePercentage: {
      type: Number,
      required: true,
      min: [0, 'Attendance percentage cannot be negative'],
      max: [100, 'Attendance percentage cannot exceed 100%'],
      default: 0,
    },
    records: {
      type: [AttendanceRecordSchema],
      required: true,
      validate: {
        validator: (records: IAttendanceRecord[]) => {
          // Ensure no duplicate user IDs in records
          const userIds = records.map((record) => record.userId.toString());
          return userIds.length === new Set(userIds).size;
        },
        message: 'Duplicate user records are not allowed',
      },
    },
    takenBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'submitted', 'approved', 'archived'],
      default: 'draft',
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks must be less than 500 characters'],
    },
    weatherConditions: {
      type: String,
      trim: true,
      maxlength: [100, 'Weather conditions must be less than 100 characters'],
    },
    specialEvents: {
      type: [String],
      validate: {
        validator: (events: string[]) =>
          events.every((event) => event.length <= 100),
        message: 'Each special event must be less than 100 characters',
      },
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
AttendanceSchema.index({ churchId: 1, branchId: 1 });
AttendanceSchema.index({ churchId: 1, attendanceDate: 1 });
AttendanceSchema.index({ serviceScheduleId: 1, attendanceDate: 1 });
AttendanceSchema.index({ branchId: 1, attendanceDate: 1 });
AttendanceSchema.index({ attendanceDate: 1, status: 1 });
AttendanceSchema.index({ takenBy: 1, createdAt: -1 });
AttendanceSchema.index({ isActive: 1, status: 1 });

// Compound index for unique attendance per service per date
AttendanceSchema.index(
  {
    serviceScheduleId: 1,
    attendanceDate: 1,
  },
  { unique: true }
);

// Add text index for searching
AttendanceSchema.index({
  remarks: 'text',
  weatherConditions: 'text',
  specialEvents: 'text',
});

// Pre-save middleware to calculate totals and percentage
AttendanceSchema.pre('save', function (next) {
  // Calculate totals from records
  this.totalPresent = this.records.filter((r) => r.status === 'present').length;
  this.totalLate = this.records.filter((r) => r.status === 'late').length;
  this.totalAbsent = this.records.filter((r) => r.status === 'absent').length;
  this.totalExcused = this.records.filter((r) => r.status === 'excused').length;

  // Calculate attendance percentage
  const totalAttended = this.totalPresent + this.totalLate;
  const totalRecorded = this.records.length;

  if (totalRecorded > 0) {
    this.attendancePercentage = Math.round(
      (totalAttended / totalRecorded) * 100
    );
  } else {
    this.attendancePercentage = 0;
  }

  // Set totalExpected if not provided
  if (!this.totalExpected) {
    this.totalExpected = totalRecorded;
  }

  next();
});

// Virtual for total attendance (present + late)
AttendanceSchema.virtual('totalAttended').get(function () {
  return this.totalPresent + this.totalLate;
});

// Virtual for formatted attendance percentage
AttendanceSchema.virtual('formattedAttendancePercentage').get(function () {
  return `${this.attendancePercentage}%`;
});

// Virtual for attendance summary
AttendanceSchema.virtual('attendanceSummary').get(function () {
  return {
    totalRecords: this.records.length,
    totalAttended: this.totalPresent + this.totalLate,
    totalPresent: this.totalPresent,
    totalLate: this.totalLate,
    totalAbsent: this.totalAbsent,
    totalExcused: this.totalExcused,
    attendanceRate: this.attendancePercentage,
  };
});

// Instance method to add attendance record
AttendanceSchema.methods.addAttendanceRecord = function (
  userId: mongoose.Types.ObjectId,
  status: 'present' | 'late' | 'absent' | 'excused',
  checkInTime?: Date,
  notes?: string
) {
  // Check if user already has a record
  const existingRecordIndex = this.records.findIndex(
    (record: any) => record.userId.toString() === userId.toString()
  );

  const attendanceRecord: IAttendanceRecord = {
    userId,
    checkInTime: checkInTime || new Date(),
    status,
    notes,
  };

  if (existingRecordIndex !== -1) {
    // Update existing record
    this.records[existingRecordIndex] = attendanceRecord;
  } else {
    // Add new record
    this.records.push(attendanceRecord);
  }

  return this.save();
};

// Instance method to remove attendance record
AttendanceSchema.methods.removeAttendanceRecord = function (
  userId: mongoose.Types.ObjectId
) {
  this.records = this.records.filter(
    (record: any) => record.userId.toString() !== userId.toString()
  );
  return this.save();
};

AttendanceSchema.set('toJSON', { virtuals: true });
AttendanceSchema.set('toObject', { virtuals: true });

// Export the Attendance model
export default (mongoose.models.Attendance as IAttendanceModel) ||
  mongoose.model<IAttendance, IAttendanceModel>('Attendance', AttendanceSchema);
