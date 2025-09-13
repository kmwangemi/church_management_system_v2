import mongoose, { type Document, Schema } from 'mongoose';

// Enums for better type safety
export enum GroupMemberRole {
  LEADER = 'leader',
  ASSISTANT_LEADER = 'assistant_leader',
  FACILITATOR = 'facilitator',
  SECRETARY = 'secretary',
  MEMBER = 'member',
}

export enum GroupActivityType {
  BIBLE_STUDY = 'bible_study',
  FELLOWSHIP = 'fellowship',
  PRAYER_MEETING = 'prayer_meeting',
  WORSHIP = 'worship',
  OUTREACH = 'outreach',
  SOCIAL_EVENT = 'social_event',
  TRAINING = 'training',
  SERVICE = 'service',
  DISCUSSION = 'discussion',
  RETREAT = 'retreat',
}

export enum GroupGoalStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export enum GroupCategory {
  BIBLE_STUDY = 'bible-study',
  FELLOWSHIP = 'fellowship',
  PRAYER = 'prayer',
  YOUTH = 'youth',
  CHILDREN = 'children',
  MARRIAGE = 'marriage',
  WORSHIP = 'worship',
  CONTRIBUTION = 'contribution',
  OTHERS = 'others',
}

// Sub-interfaces
export interface IGroupMember {
  userId: mongoose.Types.ObjectId;
  role: GroupMemberRole;
  joinedDate: Date;
  isActive: boolean;
  notes?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

export interface IAttendanceRecord {
  userId: mongoose.Types.ObjectId;
  status: AttendanceStatus;
  arrivalTime?: Date;
  notes?: string;
}

export interface IGroupActivity {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: GroupActivityType;
  date: Date;
  duration?: number; // in minutes
  location?: string;
  plannedParticipants: mongoose.Types.ObjectId[]; // Expected attendees
  actualParticipants: mongoose.Types.ObjectId[]; // Who actually attended
  organizedBy: mongoose.Types.ObjectId;
  materials?: string[]; // Resources needed/used
  notes?: string;
  attendance: IAttendanceRecord[];
  isCompleted: boolean;
  createdAt: Date;
}

export interface IGroupGoal {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  targetDate: Date;
  status: GroupGoalStatus;
  progress: number; // 0-100 percentage
  assignedTo?: mongoose.Types.ObjectId[];
  milestones?: {
    title: string;
    description?: string;
    targetDate: Date;
    isCompleted: boolean;
    completedDate?: Date;
  }[];
  metrics?: {
    target: number;
    current: number;
    unit: string; // e.g., "members", "activities", "hours"
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendanceSummary {
  date: Date;
  totalExpected: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendanceRate: number; // percentage
  records: IAttendanceRecord[];
}

// Main Group interface
export interface IGroup extends Document {
  churchId: mongoose.Types.ObjectId;
  groupName: string;
  leaderId?: mongoose.Types.ObjectId;
  meetingDay: string[];
  meetingTime: string[];
  description?: string;
  category: GroupCategory;
  location?: string;
  capacity: number;
  isActive: boolean;
  // Enhanced fields
  members: IGroupMember[];
  activities: IGroupActivity[];
  goals: IGroupGoal[];
  attendanceSummaries: IAttendanceSummary[];
  // Group statistics
  stats: {
    totalMembers: number;
    activeMembers: number;
    averageAttendance: number;
    totalActivities: number;
    completedGoals: number;
  };
  createdAt: Date;
  updatedAt: Date;
  // Custom instance methods
  getActiveMembers(): IGroupMember[];
  getCurrentAttendanceRate(): number;
  isAtCapacity(): boolean;
  getUpcomingActivities(): IGroupActivity[];
  getGoalsByStatus(status: GroupGoalStatus): IGroupGoal[];
  updateStats(): void;
}

interface MeetingDayValidator {
  validator: (arr: string[]) => boolean;
  message: string;
}

interface GroupSchemaType extends IGroup {
  // Additional fields or overrides if needed
}

// Sub-schemas
const GroupMemberSchema = new Schema<IGroupMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(GroupMemberRole),
    required: true,
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
});

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(AttendanceStatus),
    required: true,
  },
  arrivalTime: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const GroupActivitySchema = new Schema<IGroupActivity>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(GroupActivityType),
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    plannedParticipants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    actualParticipants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    organizedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    materials: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
    attendance: [AttendanceRecordSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const GroupGoalSchema = new Schema<IGroupGoal>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(GroupGoalStatus),
      default: GroupGoalStatus.PLANNED,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    milestones: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        targetDate: {
          type: Date,
          required: true,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedDate: {
          type: Date,
        },
      },
    ],
    metrics: {
      target: {
        type: Number,
        required: true,
      },
      current: {
        type: Number,
        default: 0,
      },
      unit: {
        type: String,
        required: true,
        trim: true,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const AttendanceSummarySchema = new Schema<IAttendanceSummary>({
  date: {
    type: Date,
    required: true,
  },
  totalExpected: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPresent: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAbsent: {
    type: Number,
    required: true,
    min: 0,
  },
  totalLate: {
    type: Number,
    default: 0,
    min: 0,
  },
  attendanceRate: {
    type: Number,
    min: 0,
    max: 100,
  },
  records: [AttendanceRecordSchema],
});

// Main Group Schema
const GroupSchema = new Schema<GroupSchemaType>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    groupName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(GroupCategory),
      required: true,
    },
    meetingDay: {
      type: [String],
      required: true,
      validate: [
        {
          validator(arr: string[]): boolean {
            return arr && arr.length > 0;
          },
          message: 'At least one meeting day is required',
        } as MeetingDayValidator,
        {
          validator(arr: string[]): boolean {
            const validDays = [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            ];
            return (arr as string[]).every((day: string) =>
              validDays.includes(day.toLowerCase())
            );
          },
          message: 'Invalid meeting day provided',
        } as MeetingDayValidator,
      ],
      set(arr: string[]): string[] {
        return arr.map((day: string) => day.toLowerCase().trim());
      },
    },
    meetingTime: {
      type: [String],
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      lowercase: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Enhanced fields
    members: [GroupMemberSchema],
    activities: [GroupActivitySchema],
    goals: [GroupGoalSchema],
    attendanceSummaries: [AttendanceSummarySchema],
    // Group statistics
    stats: {
      totalMembers: {
        type: Number,
        default: 0,
      },
      activeMembers: {
        type: Number,
        default: 0,
      },
      averageAttendance: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      totalActivities: {
        type: Number,
        default: 0,
      },
      completedGoals: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    // Add useful methods
    methods: {
      // Get active members
      getActiveMembers(): IGroupMember[] {
        return this.members.filter((member) => member.isActive);
      },
      // Calculate current attendance rate
      getCurrentAttendanceRate(): number {
        const recentSummaries = this.attendanceSummaries.slice(-5); // Last 5 meetings
        if (recentSummaries.length === 0) return 0;
        const avgRate =
          recentSummaries.reduce(
            (sum, summary) => sum + summary.attendanceRate,
            0
          ) / recentSummaries.length;
        return Math.round(avgRate);
      },
      // Check if group is at capacity
      isAtCapacity(): boolean {
        return this.getActiveMembers().length >= this.capacity;
      },
      // Get upcoming activities
      getUpcomingActivities(): IGroupActivity[] {
        const now = new Date();
        return this.activities
          .filter((activity) => activity.date > now && !activity.isCompleted)
          .sort((a, b) => a.date.getTime() - b.date.getTime());
      },
      // Get goals by status
      getGoalsByStatus(status: GroupGoalStatus): IGroupGoal[] {
        return this.goals.filter((goal) => goal.status === status);
      },
      // Update group statistics
      updateStats(): void {
        const activeMembers = this.getActiveMembers();
        this.stats.totalMembers = this.members.length;
        this.stats.activeMembers = activeMembers.length;
        this.stats.averageAttendance = this.getCurrentAttendanceRate();
        this.stats.totalActivities = this.activities.length;
        this.stats.completedGoals = this.goals.filter(
          (goal) => goal.status === GroupGoalStatus.COMPLETED
        ).length;
      },
    },
  }
);

// Pre-save middleware to update stats
GroupSchema.pre('save', function () {
  this.updateStats();
});

// Indexes for better query performance
GroupSchema.index({ churchId: 1 });
GroupSchema.index({ leaderId: 1 });
GroupSchema.index({ category: 1 });
GroupSchema.index({ 'members.userId': 1 });
GroupSchema.index({ 'activities.date': 1 });
GroupSchema.index({ 'goals.targetDate': 1 });
GroupSchema.index({ 'attendanceSummaries.date': 1 });

export default mongoose.models.Group ||
  mongoose.model<IGroup>('Group', GroupSchema);
