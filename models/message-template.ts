import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define the interface for a MessageTemplate document
export interface IMessageTemplate extends Document {
  churchId: mongoose.Types.ObjectId;
  name: string;
  type: 'sms' | 'email';
  category:
    | 'service-reminder'
    | 'event-registration'
    | 'welcome-member'
    | 'announcement'
    | 'custom';
  title: string;
  content: string;
  variables: string[]; // Array of variable names that can be replaced (e.g., ['memberName', 'eventDate'])
  isActive: boolean;
  usageCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for static methods
export interface IMessageTemplateModel extends Model<IMessageTemplate> {
  findActiveTemplates(
    churchId: mongoose.Types.ObjectId,
    type?: string
  ): Promise<IMessageTemplate[]>;
}

// Define the Mongoose Schema for MessageTemplate
const MessageTemplateSchema = new Schema<IMessageTemplate>(
  {
    churchId: {
      type: Schema.Types.ObjectId,
      ref: 'Church',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Template name must be at least 2 characters'],
      maxlength: [100, 'Template name must be less than 100 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: ['sms', 'email'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'service-reminder',
        'event-registration',
        'welcome-member',
        'announcement',
        'custom',
      ],
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Template title must be at least 2 characters'],
      maxlength: [100, 'Template title must be less than 100 characters'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Template content must be at least 10 characters'],
      maxlength: [5000, 'Template content must be less than 5000 characters'],
    },
    variables: {
      type: [String],
      default: [],
      validate: {
        validator(v: string[]) {
          // Validate that all variables follow naming convention (alphanumeric + underscore)
          return v.every((variable) =>
            // biome-ignore lint/performance/useTopLevelRegex: ignore
            /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable)
          );
        },
        message:
          'Variable names must be valid identifiers (letters, numbers, underscore only)',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
MessageTemplateSchema.index({ churchId: 1, isActive: 1 });
MessageTemplateSchema.index({ churchId: 1, type: 1, isActive: 1 });
MessageTemplateSchema.index({ churchId: 1, category: 1, isActive: 1 });
MessageTemplateSchema.index({ createdBy: 1 });

// Add text index for searching
MessageTemplateSchema.index({
  name: 'text',
  title: 'text',
  content: 'text',
});

// Ensure unique template names per church
MessageTemplateSchema.index({ churchId: 1, name: 1 }, { unique: true });

// Pre-save middleware
MessageTemplateSchema.pre('save', function (next) {
  // Extract variables from content automatically
  const variablePattern = /\{\{(\w+)\}\}/g;
  const extractedVariables = new Set<string>();
  // biome-ignore lint/suspicious/noEvolvingTypes: ignore
  // biome-ignore lint/suspicious/noImplicitAnyLet: ignore
    let match;
  // biome-ignore lint/suspicious/noAssignInExpressions: ignore
  while ((match = variablePattern.exec(this.content)) !== null) {
    extractedVariables.add(match[1]);
  }
  // Also check title for variables
  variablePattern.lastIndex = 0;
  // biome-ignore lint/suspicious/noAssignInExpressions: ignore
  while ((match = variablePattern.exec(this.title)) !== null) {
    extractedVariables.add(match[1]);
  }
  // Update variables array with extracted variables
  this.variables = Array.from(extractedVariables);
  next();
});

// Static methods
MessageTemplateSchema.statics.findActiveTemplates = function (
  churchId: mongoose.Types.ObjectId,
  type?: string
) {
  const query: any = { churchId, isActive: true };
  if (type) {
    query.type = type;
  }
  return this.find(query).sort({ usageCount: -1, name: 1 });
};

// Instance methods
MessageTemplateSchema.methods.replaceVariables = function (
  variables: Record<string, string>
) {
  let processedTitle = this.title;
  let processedContent = this.content;
  // Replace variables in title and content
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processedTitle = processedTitle.replace(regex, value);
    processedContent = processedContent.replace(regex, value);
  });
  return {
    title: processedTitle,
    content: processedContent,
  };
};

MessageTemplateSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  return this.save();
};

// Virtual for variable count
MessageTemplateSchema.virtual('variableCount').get(function () {
  return this.variables.length;
});

// Virtual for content preview (first 100 characters)
MessageTemplateSchema.virtual('contentPreview').get(function () {
  return this.content.length > 100
    ? `${this.content.substring(0, 100)}...`
    : this.content;
});

// Ensure virtuals are included in JSON output
MessageTemplateSchema.set('toJSON', { virtuals: true });
MessageTemplateSchema.set('toObject', { virtuals: true });

// Export the MessageTemplate model
export default (mongoose.models.MessageTemplate as IMessageTemplateModel) ||
  mongoose.model<IMessageTemplate, IMessageTemplateModel>(
    'MessageTemplate',
    MessageTemplateSchema
  );
