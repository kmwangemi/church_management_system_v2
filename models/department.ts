import mongoose, { type Document, Schema } from 'mongoose';

// Enums for better type safety
export enum MemberRole {
  LEADER = 'leader',
  ASSISTANT_LEADER = 'assistant_leader',
  COORDINATOR = 'coordinator',
  MEMBER = 'member',
  VOLUNTEER = 'volunteer',
}

export enum ActivityType {
  MEETING = 'meeting',
  TRAINING = 'training',
  EVENT = 'event',
  OUTREACH = 'outreach',
  WORSHIP = 'worship',
  FELLOWSHIP = 'fellowship',
  SERVICE = 'service',
}

export enum GoalStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ExpenseCategory {
  EQUIPMENT = 'equipment',
  MATERIALS = 'materials',
  TRAINING = 'training',
  EVENTS = 'events',
  UTILITIES = 'utilities',
  TRANSPORTATION = 'transportation',
  REFRESHMENTS = 'refreshments',
  MISCELLANEOUS = 'miscellaneous',
}

export enum DepartmentCategory {
  MINISTRY = 'ministry',
  ADMINISTRATION = 'administration',
  OPERATIONS = 'operations',
  EDUCATION = 'education',
  OUTREACH = 'outreach',
  SUPPORT = 'support',
  FINANCE = 'finance',
  FACILITIES = 'facilities',
  TECHNOLOGY = 'technology',
  COMMUNICATIONS = 'communications',
  PASTORAL_CARE = 'pastoral_care',
  MISSIONS = 'missions',
  YOUTH = 'youth',
  CHILDREN = 'children',
  WORSHIP = 'worship',
  DISCIPLESHIP = 'discipleship',
  COMMUNITY = 'community',
  EVENTS = 'events',
  SECURITY = 'security',
  VOLUNTEER_COORDINATION = 'volunteer_coordination',
}

// Sub-interfaces
export interface IDepartmentMember {
  userId: mongoose.Types.ObjectId;
  role: MemberRole;
  skills: string[];
  joinedDate: Date;
  isActive: boolean;
  notes?: string;
}

export interface IBudgetCategory {
  category: ExpenseCategory;
  allocatedAmount: number;
  spentAmount: number;
  description?: string;
}

export interface IExpense {
  _id?: mongoose.Types.ObjectId;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date;
  approvedBy?: mongoose.Types.ObjectId;
  receiptUrl?: string;
  reference?: string;
  vendor?: string;
  createdAt: Date;
}

export interface IDepartmentActivity {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: ActivityType;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  participants: mongoose.Types.ObjectId[];
  // organizedBy: mongoose.Types.ObjectId;
  notes?: string;
  isCompleted: boolean;
  createdAt: Date;
}

export interface IDepartmentGoal {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  targetDate: Date;
  status: GoalStatus;
  priority: string;
  assignee?: mongoose.Types.ObjectId;
  category: string;
  success: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Main Department interface
export interface IDepartment extends Document {
  churchId: mongoose.Types.ObjectId;
  leaderId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  departmentName: string;
  description: string;
  location?: string;
  category: DepartmentCategory;
  establishedDate: Date;
  meetingDay: string[];
  meetingTime: string[];
  isActive: boolean;
  isDeleted: boolean;
  // Enhanced fields
  members: IDepartmentMember[];
  totalBudget: number;
  budgetCategories: IBudgetCategory[];
  expenses: IExpense[];
  activities: IDepartmentActivity[];
  goals: IDepartmentGoal[];
  createdAt: Date;
  updatedAt: Date;
}

interface MeetingDayValidator {
  validator: (arr: string[]) => boolean;
  message: string;
}

interface DepartmentSchemaType extends IDepartment {
  // Additional fields or overrides if needed
}

// Sub-schemas
const MemberSchema = new Schema<IDepartmentMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(MemberRole),
    required: true,
  },
  skills: [
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ],
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
});

const BudgetCategorySchema = new Schema<IBudgetCategory>({
  category: {
    type: String,
    enum: Object.values(ExpenseCategory),
    required: true,
  },
  allocatedAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
});

const ExpenseSchema = new Schema<IExpense>(
  {
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    vendor: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ActivitySchema = new Schema<IDepartmentActivity>(
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
      enum: Object.values(ActivityType),
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      trim: true,
      match: [
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]( (AM|PM))?$/i,
        'Invalid time format',
      ],
    },
    endTime: {
      type: String,
      trim: true,
      match: [
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]( (AM|PM))?$/i,
        'Invalid time format',
      ],
    },
    location: {
      type: String,
      trim: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // organizedBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
    notes: {
      type: String,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const GoalSchema = new Schema<IDepartmentGoal>(
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
      enum: Object.values(GoalStatus),
      default: GoalStatus.PLANNED,
    },
    priority: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Main Department Schema
const DepartmentSchema = new Schema<DepartmentSchemaType>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
      trim: true,
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      trim: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      trim: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(DepartmentCategory),
      required: true,
    },
    establishedDate: {
      type: Date,
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
    description: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: { type: Boolean, required: true, default: false },
    // Enhanced fields
    members: [MemberSchema],
    totalBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    budgetCategories: [BudgetCategorySchema],
    expenses: [ExpenseSchema],
    activities: [ActivitySchema],
    goals: [GoalSchema],
  },
  {
    timestamps: true,
    // Add useful methods
    methods: {
      // Calculate remaining budget
      getRemainingBudget(): number {
        return (
          this.totalBudget -
          this.expenses.reduce((total, expense) => total + expense.amount, 0)
        );
      },
      // Get active members
      getActiveMembers(): IDepartmentMember[] {
        return this.members.filter((member) => member.isActive);
      },
      // Get completed activities
      getCompletedActivities(): IDepartmentActivity[] {
        return this.activities.filter((activity) => activity.isCompleted);
      },
      // Get goals by status
      getGoalsByStatus(status: GoalStatus): IDepartmentGoal[] {
        return this.goals.filter((goal) => goal.status === status);
      },
      // soft delete
      softDelete(): Promise<IDepartment> {
        this.isDeleted = true;
        return this.save();
      },
    },
  }
);

// Indexes for better query performance
DepartmentSchema.index({ churchId: 1 });
DepartmentSchema.index({ leaderId: 1 });
DepartmentSchema.index({ branchId: 1 });
DepartmentSchema.index({ 'members.userId': 1 });
DepartmentSchema.index({ 'activities.date': 1 });
DepartmentSchema.index({ 'goals.targetDate': 1 });
DepartmentSchema.index({ 'expenses.date': 1 });

export default mongoose.models.Department ||
  mongoose.model<IDepartment>('Department', DepartmentSchema);
