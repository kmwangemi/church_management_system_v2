-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'VISITOR');

-- CreateEnum
CREATE TYPE "ORGANIZATIONUserRole" AS ENUM ('MEMBER', 'PASTOR', 'BISHOP', 'ADMIN', 'VISITOR');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'NEW', 'TRANSFERRED', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PastorAssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CASUAL', 'CONTRACT');

-- CreateEnum
CREATE TYPE "VolunteerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_HOLD', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ClearanceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AdminAccessLevel" AS ENUM ('NATIONAL', 'REGIONAL', 'BRANCH');

-- CreateEnum
CREATE TYPE "HowDidYouHear" AS ENUM ('FRIEND', 'WEBSITE', 'ADVERTISEMENT', 'FAMILY', 'ONLINE', 'FLYER', 'OTHER');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'CONTACTED', 'CONVERTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "DepartmentCategory" AS ENUM ('MINISTRY', 'ADMINISTRATION', 'OPERATIONS', 'EDUCATION', 'OUTREACH', 'SUPPORT', 'FINANCE', 'FACILITIES', 'TECHNOLOGY', 'COMMUNICATIONS', 'PASTORAL_CARE', 'MISSIONS', 'YOUTH', 'CHILDREN', 'WORSHIP', 'DISCIPLESHIP', 'COMMUNITY', 'EVENTS', 'SECURITY', 'VOLUNTEER_COORDINATION');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('SALARIES', 'RENT', 'MAINTENANCE', 'MISSIONS', 'OTHER', 'EQUIPMENT', 'MATERIALS', 'TRAINING', 'EVENTS', 'UTILITIES', 'TRANSPORTATION', 'REFRESHMENTS', 'MISCELLANEOUS');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MEETING', 'EVENT', 'TRAINING', 'OUTREACH', 'OTHER', 'BIBLE_STUDY', 'PRAYER_MEETING', 'SOCIAL_EVENT', 'DISCUSSION', 'RETREAT', 'WORSHIP', 'FELLOWSHIP', 'SERVICE');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('LEADER', 'ASSISTANT_LEADER', 'COORDINATOR', 'MEMBER', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "GroupCategory" AS ENUM ('SMALL_GROUP', 'MINISTRY', 'BIBLE_STUDY', 'SUPPORT', 'YOUTH', 'PRAYER', 'FELLOWSHIP', 'CHILDREN', 'MARRIAGE', 'WORSHIP', 'CONTRIBUTION', 'OTHERS');

-- CreateEnum
CREATE TYPE "GroupActivityType" AS ENUM ('FELLOWSHIP', 'STUDY', 'SERVICE', 'OUTREACH', 'BIBLE_STUDY', 'PRAYER_MEETING', 'SOCIAL_EVENT', 'DISCUSSION', 'RETREAT', 'MEETING', 'TRAINING', 'EVENT', 'WORSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "GroupGoalStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "OfferingType" AS ENUM ('TITHE', 'OFFERING', 'BUILDING_FUND', 'MISSIONS', 'SPECIAL_GIVING', 'SPECIAL_OFFERING', 'THANKSGIVING', 'PARTNERSHIP', 'DONATION', 'MISSION', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'M_PESA', 'BANK_TRANSFER', 'CHEQUE', 'OTHER', 'CARD', 'ONLINE');

-- CreateEnum
CREATE TYPE "PledgePurpose" AS ENUM ('BUILDING', 'MISSIONS', 'GENERAL', 'OTHER', 'YOUTH_PROGRAM', 'EQUIPMENT', 'OUTREACH', 'EDUCATION');

-- CreateEnum
CREATE TYPE "PaymentSchedule" AS ENUM ('ONE_TIME', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PledgeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PrayerCategory" AS ENUM ('PERSONAL', 'CHURCH', 'COMMUNITY', 'GLOBAL', 'THANKSGIVING', 'HEALTH', 'FAMILY', 'CAREER', 'FINANCIAL', 'SPIRITUAL', 'GUIDANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PrayerStatus" AS ENUM ('ACTIVE', 'ANSWERED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('WORSHIP', 'PRAYER', 'STUDY', 'FELLOWSHIP', 'BIBLE_STUDY', 'YOUTH', 'CHILDREN', 'SPECIAL');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'DISPOSED', 'SOLD', 'DONATED', 'LOST', 'STOLEN');

-- CreateEnum
CREATE TYPE "AnnouncementTarget" AS ENUM ('ALL', 'BRANCH', 'DEPARTMENT', 'GROUP');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('FINANCE', 'MEMBERSHIP', 'ATTENDANCE', 'EVENTS', 'GOALS', 'FINANCIAL', 'GIVING', 'ACTIVITIES');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'FAILED', 'READ', 'DRAFT', 'SCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContentCategory" AS ENUM ('SPIRITUAL', 'EDUCATIONAL', 'ADMINISTRATIVE', 'WORSHIP', 'YOUTH', 'CHILDREN', 'MISSIONS', 'FELLOWSHIP', 'OUTREACH', 'DISCIPLESHIP');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('SERMON', 'BIBLE_STUDY', 'PRAYER', 'WORSHIP', 'ANNOUNCEMENT', 'EVENT', 'DEVOTIONAL', 'TESTIMONY', 'MUSIC', 'VIDEO', 'DOCUMENT', 'IMAGE', 'AUDIO');

-- CreateEnum
CREATE TYPE "DiscipleLevel" AS ENUM ('NEW_CONVERT', 'GROWING', 'MATURE', 'LEADER');

-- CreateEnum
CREATE TYPE "DiscipleStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('SERVICE_REMINDER', 'EVENT_REGISTRATION', 'WELCOME_MEMBER', 'ANNOUNCEMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('NOW', 'SCHEDULED', 'DRAFT');

-- CreateEnum
CREATE TYPE "ChurchPlan" AS ENUM ('BASIC', 'MINISTRY', 'CATHEDRAL');

-- CreateEnum
CREATE TYPE "MaintenanceSchedule" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('VEHICLE', 'PROPERTY', 'EQUIPMENT', 'FURNITURE', 'TECHNOLOGY', 'MUSICAL');

-- CreateEnum
CREATE TYPE "ActivityTypeEnum" AS ENUM ('SERVICE', 'MEETING', 'EVENT', 'PROGRAM', 'MINISTRY', 'SOCIAL', 'OUTREACH');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('CONNECT', 'ENGAGE', 'SERVE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED', 'TRIAL');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CREDIT_CARD', 'PAYPAL', 'STRIPE', 'M_PESA');

-- CreateEnum
CREATE TYPE "DateRange" AS ENUM ('LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_3_MONTHS', 'LAST_6_MONTHS', 'LAST_YEAR', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('ALL_USERS', 'ACTIVE_USERS', 'DEPARTMENT', 'GROUP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TargetModel" AS ENUM ('USER', 'DEPARTMENT', 'GROUP');

-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('GENERAL', 'SERVICE', 'EVENT', 'PRAYER', 'MINISTRY', 'YOUTH', 'CHILDREN', 'FINANCE', 'VOLUNTEER', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('ERROR', 'WARN', 'INFO', 'DEBUG');

-- CreateEnum
CREATE TYPE "LogSource" AS ENUM ('API', 'CLIENT', 'SERVER', 'DATABASE', 'AUTH', 'PAYMENT', 'EMAIL');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TEST');

-- CreateEnum
CREATE TYPE "MilestoneCategory" AS ENUM ('SPIRITUAL_GROWTH', 'BIBLE_STUDY', 'PRAYER', 'SERVICE', 'LEADERSHIP', 'EVANGELISM', 'FELLOWSHIP', 'WORSHIP', 'DISCIPLESHIP');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "occupation" TEXT,
    "maritalStatus" "MaritalStatus",
    "skills" TEXT[],
    "notes" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VISITOR',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLogin" TIMESTAMP(3),
    "isMember" BOOLEAN NOT NULL DEFAULT false,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "isVolunteer" BOOLEAN NOT NULL DEFAULT false,
    "isPasswordUpdated" BOOLEAN NOT NULL DEFAULT false,
    "agreeToTerms" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,
    "denomination" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "website" TEXT,
    "establishedDate" TIMESTAMP(3) NOT NULL,
    "churchSize" TEXT NOT NULL,
    "numberOfBranches" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ORGANIZATIONUserRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "branchId" TEXT,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Kenya',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "churchId" TEXT,
    "branchId" TEXT,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contact" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "emergency_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_details" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "membershipDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membershipStatus" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "occupation" TEXT,
    "baptismDate" TIMESTAMP(3),
    "joinedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentIds" TEXT[],
    "groupIds" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "member_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pastor_details" (
    "id" TEXT NOT NULL,
    "pastorId" TEXT NOT NULL,
    "ordinationDate" TIMESTAMP(3),
    "qualifications" TEXT[],
    "specializations" TEXT[],
    "sermonCount" INTEGER NOT NULL DEFAULT 0,
    "counselingSessions" INTEGER NOT NULL DEFAULT 0,
    "biography" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "pastor_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pastor_assignment" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "branchId" TEXT,
    "pastorDetailsId" TEXT NOT NULL,

    CONSTRAINT "pastor_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bishop_details" (
    "id" TEXT NOT NULL,
    "bishopId" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3),
    "jurisdictionArea" TEXT,
    "qualifications" TEXT[],
    "achievements" TEXT[],
    "biography" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "branchIds" TEXT[],
    "pastorIds" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "bishop_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_details" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "salary" DOUBLE PRECISION,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'CASUAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "staff_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_details" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "volunteerStatus" "VolunteerStatus" NOT NULL DEFAULT 'ACTIVE',
    "hoursContributed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departments" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "volunteer_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_schedule" (
    "id" TEXT NOT NULL,
    "days" TEXT[],
    "timeSlots" TEXT[],
    "preferredTimes" TEXT[],
    "volunteerDetailsId" TEXT NOT NULL,

    CONSTRAINT "availability_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_role" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "volunteerDetailsId" TEXT NOT NULL,

    CONSTRAINT "volunteer_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_check" (
    "id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "clearanceLevel" "ClearanceLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "volunteerDetailsId" TEXT NOT NULL,

    CONSTRAINT "background_check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_details" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "accessLevel" "AdminAccessLevel" NOT NULL DEFAULT 'NATIONAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedBranches" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "admin_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_details" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "howDidYouHear" "HowDidYouHear" NOT NULL DEFAULT 'OTHER',
    "followUpStatus" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "interestedInMembership" BOOLEAN NOT NULL DEFAULT false,
    "servicesAttended" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invitedBy" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "visitor_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch" (
    "id" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "capacity" INTEGER NOT NULL,
    "members" INTEGER NOT NULL DEFAULT 0,
    "establishedDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "pastorId" TEXT,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "category" "DepartmentCategory" NOT NULL,
    "establishedDate" TIMESTAMP(3) NOT NULL,
    "meetingDay" TEXT[],
    "meetingTime" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "totalBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT,
    "leaderId" TEXT,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_member" (
    "id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,
    "skills" TEXT[],
    "joinedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "departmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "department_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_category" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "allocatedAmount" DOUBLE PRECISION NOT NULL,
    "spentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "budget_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "vendor" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departmentId" TEXT NOT NULL,
    "approvedBy" TEXT,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "participants" TEXT[],
    "notes" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departmentId" TEXT NOT NULL,
    "organizedBy" TEXT NOT NULL,

    CONSTRAINT "department_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'PLANNED',
    "priority" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "success" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT NOT NULL,
    "assignee" TEXT,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "department_goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "description" TEXT,
    "category" "GroupCategory" NOT NULL,
    "meetingDay" TEXT[],
    "meetingTime" TEXT[],
    "location" TEXT,
    "establishedDate" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "activeMembers" INTEGER NOT NULL DEFAULT 0,
    "averageAttendance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalActivities" INTEGER NOT NULL DEFAULT 0,
    "completedGoals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "leaderId" TEXT,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_member" (
    "id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,
    "joinedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "group_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "GroupActivityType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "participants" TEXT[],
    "notes" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" TEXT NOT NULL,
    "organizedBy" TEXT NOT NULL,

    CONSTRAINT "group_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "status" "GroupGoalStatus" NOT NULL DEFAULT 'PLANNED',
    "priority" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "success" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,
    "assignee" TEXT,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "group_goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_summary" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalExpected" INTEGER NOT NULL,
    "totalPresent" INTEGER NOT NULL,
    "totalAbsent" INTEGER NOT NULL,
    "totalLate" INTEGER NOT NULL DEFAULT 0,
    "attendanceRate" DOUBLE PRECISION NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "attendance_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_record" (
    "id" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "arrivalTime" TIMESTAMP(3),
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "groupActivityId" TEXT,
    "attendanceSummaryId" TEXT,
    "attendanceId" TEXT,

    CONSTRAINT "attendance_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "expectedAttendees" INTEGER NOT NULL,
    "organizer" TEXT NOT NULL,
    "maxAttendees" INTEGER,
    "requiresRegistration" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "registrationDeadline" TIMESTAMP(3),
    "notes" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" "EventStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activity" TEXT NOT NULL,
    "participants" INTEGER NOT NULL,
    "type" "ActivityTypeEnum" NOT NULL DEFAULT 'EVENT',
    "status" "ActivityStatus" NOT NULL DEFAULT 'PLANNED',
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "facilitator" TEXT,
    "budget" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offering" (
    "id" TEXT NOT NULL,
    "type" "OfferingType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "offering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pledge" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remaining" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "purpose" "PledgePurpose" NOT NULL,
    "paymentSchedule" "PaymentSchedule" NOT NULL DEFAULT 'ONE_TIME',
    "notes" TEXT,
    "status" "PledgeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "pledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_request" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "PrayerCategory" NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "PrayerStatus" NOT NULL DEFAULT 'ACTIVE',
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "answeredDate" TIMESTAMP(3),
    "answerDescription" TEXT,
    "prayerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "memberId" TEXT,
    "submittedBy" TEXT NOT NULL,

    CONSTRAINT "prayer_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_schedule" (
    "id" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "time" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "attendance" INTEGER,
    "type" "ServiceType" NOT NULL DEFAULT 'WORSHIP',
    "duration" INTEGER DEFAULT 90,
    "facilitator" TEXT,
    "location" TEXT,
    "recurring" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "service_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "totalAttendees" INTEGER NOT NULL,
    "offeringAmount" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "takenBy" TEXT NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "value" DOUBLE PRECISION NOT NULL,
    "condition" "AssetCondition" NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "serialNumber" TEXT,
    "warranty" TEXT,
    "supplier" TEXT,
    "maintenanceSchedule" "MaintenanceSchedule",
    "currentValue" DOUBLE PRECISION,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_record" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "performedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "maintenance_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "AnnouncementCategory" NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "publishDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "targetAudience" TEXT[],
    "attachments" TEXT[],
    "isSticky" BOOLEAN NOT NULL DEFAULT false,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "church_subscription" (
    "id" TEXT NOT NULL,
    "plan" "ChurchPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "invoiceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxUsers" INTEGER,
    "maxBranches" INTEGER DEFAULT 1,
    "maxSmallGroups" INTEGER,
    "currentUsers" INTEGER NOT NULL DEFAULT 0,
    "currentBranches" INTEGER NOT NULL DEFAULT 0,
    "currentSmallGroups" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isAutoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentMethod" "PaymentMethodType" DEFAULT 'M_PESA',
    "lastPaymentDate" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,

    CONSTRAINT "church_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscription" (
    "id" TEXT NOT NULL,
    "plan" "UserPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "invoiceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "features" TEXT[],
    "churchId" TEXT,
    "maxSmallGroupsLead" INTEGER DEFAULT 0,
    "currentSmallGroupsLead" INTEGER DEFAULT 0,
    "maxEventsManage" INTEGER DEFAULT 0,
    "currentEventsManage" INTEGER DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isAutoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentMethod" "PaymentMethodType" DEFAULT 'M_PESA',
    "lastPaymentDate" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "errorName" TEXT,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "errorCode" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "LogSource" NOT NULL,
    "environment" "Environment" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "churchId" TEXT NOT NULL,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "relatedEntityType" TEXT NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "payerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "description" TEXT NOT NULL,
    "dateRange" "DateRange" NOT NULL DEFAULT 'LAST_30_DAYS',
    "customStartDate" TIMESTAMP(3),
    "customEndDate" TIMESTAMP(3),
    "format" "ReportFormat" NOT NULL DEFAULT 'PDF',
    "includeCharts" BOOLEAN NOT NULL DEFAULT true,
    "includeComparisons" BOOLEAN NOT NULL DEFAULT false,
    "departments" TEXT[],
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATING',
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "generatedAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_data" (
    "id" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "generationTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "report_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_count" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "reportDataId" TEXT NOT NULL,

    CONSTRAINT "department_count_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "MilestoneCategory" NOT NULL,
    "points" INTEGER NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completionDate" TIMESTAMP(3),
    "requirements" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "level" "DiscipleLevel" NOT NULL,
    "prerequisiteMilestones" TEXT[],
    "completionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT,

    CONSTRAINT "milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "message_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "recipients" TEXT[],
    "scheduleType" "ScheduleType" NOT NULL DEFAULT 'NOW',
    "scheduleDate" TIMESTAMP(3),
    "scheduleTime" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT,
    "templateId" TEXT,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_delivery_stats" (
    "id" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "sent" INTEGER NOT NULL DEFAULT 0,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "message_delivery_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_recipient" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "RecipientType" NOT NULL DEFAULT 'CUSTOM',
    "targetModel" "TargetModel" NOT NULL,
    "targetId" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoUpdate" BOOLEAN NOT NULL DEFAULT true,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "message_recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipient_criteria" (
    "id" TEXT NOT NULL,
    "userStatus" TEXT[],
    "roles" TEXT[],
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "gender" "Gender",
    "departmentIds" TEXT[],
    "groupIds" TEXT[],
    "customQuery" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "recipient_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciple" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "currentLevel" "DiscipleLevel" NOT NULL,
    "status" "DiscipleStatus" NOT NULL DEFAULT 'ACTIVE',
    "goals" TEXT NOT NULL,
    "notes" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "milestonesCompleted" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT,
    "memberId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,

    CONSTRAINT "disciple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciple_progress" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "topic" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "discipleId" TEXT NOT NULL,
    "branchId" TEXT,

    CONSTRAINT "disciple_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone_progress" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "discipleProgressId" TEXT NOT NULL,

    CONSTRAINT "milestone_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "category" "ContentCategory" NOT NULL,
    "tags" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "fileMimeType" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "churchId" TEXT NOT NULL,
    "branchId" TEXT,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DiscipleProgressToMilestone" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DiscipleProgressToMilestone_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_role_status_idx" ON "user"("role", "status");

-- CreateIndex
CREATE INDEX "user_isDeleted_idx" ON "user"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_email_key" ON "organization"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_phoneNumber_key" ON "organization"("phoneNumber");

-- CreateIndex
CREATE INDEX "organization_denomination_idx" ON "organization"("denomination");

-- CreateIndex
CREATE INDEX "organization_churchSize_idx" ON "organization"("churchSize");

-- CreateIndex
CREATE INDEX "organization_isSuspended_isDeleted_idx" ON "organization"("isSuspended", "isDeleted");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "member"("userId");

-- CreateIndex
CREATE INDEX "member_branchId_idx" ON "member"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "member_organizationId_userId_key" ON "member"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_organizationId_email_key" ON "invitation"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "address_userId_key" ON "address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "address_churchId_key" ON "address"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX "address_branchId_key" ON "address"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_contact_userId_key" ON "emergency_contact"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "member_details_userId_key" ON "member_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pastor_details_userId_key" ON "pastor_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bishop_details_userId_key" ON "bishop_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_details_userId_key" ON "staff_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_details_userId_key" ON "volunteer_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "availability_schedule_volunteerDetailsId_key" ON "availability_schedule"("volunteerDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "background_check_volunteerDetailsId_key" ON "background_check"("volunteerDetailsId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_details_userId_key" ON "admin_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_details_userId_key" ON "visitor_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "branch_branchName_key" ON "branch"("branchName");

-- CreateIndex
CREATE INDEX "branch_churchId_isActive_idx" ON "branch"("churchId", "isActive");

-- CreateIndex
CREATE INDEX "branch_churchId_isDeleted_idx" ON "branch"("churchId", "isDeleted");

-- CreateIndex
CREATE INDEX "branch_pastorId_idx" ON "branch"("pastorId");

-- CreateIndex
CREATE INDEX "department_churchId_idx" ON "department"("churchId");

-- CreateIndex
CREATE INDEX "department_leaderId_idx" ON "department"("leaderId");

-- CreateIndex
CREATE INDEX "group_churchId_idx" ON "group"("churchId");

-- CreateIndex
CREATE INDEX "group_leaderId_idx" ON "group"("leaderId");

-- CreateIndex
CREATE INDEX "group_category_idx" ON "group"("category");

-- CreateIndex
CREATE INDEX "event_churchId_startDate_idx" ON "event"("churchId", "startDate");

-- CreateIndex
CREATE INDEX "event_status_idx" ON "event"("status");

-- CreateIndex
CREATE INDEX "event_branchId_idx" ON "event"("branchId");

-- CreateIndex
CREATE INDEX "activity_churchId_branchId_idx" ON "activity"("churchId", "branchId");

-- CreateIndex
CREATE INDEX "activity_churchId_date_idx" ON "activity"("churchId", "date");

-- CreateIndex
CREATE INDEX "activity_date_status_idx" ON "activity"("date", "status");

-- CreateIndex
CREATE INDEX "offering_churchId_date_idx" ON "offering"("churchId", "date");

-- CreateIndex
CREATE INDEX "offering_memberId_date_idx" ON "offering"("memberId", "date");

-- CreateIndex
CREATE INDEX "pledge_churchId_status_idx" ON "pledge"("churchId", "status");

-- CreateIndex
CREATE INDEX "pledge_memberId_status_idx" ON "pledge"("memberId", "status");

-- CreateIndex
CREATE INDEX "pledge_dueDate_status_idx" ON "pledge"("dueDate", "status");

-- CreateIndex
CREATE INDEX "prayer_request_churchId_branchId_idx" ON "prayer_request"("churchId", "branchId");

-- CreateIndex
CREATE INDEX "prayer_request_churchId_category_idx" ON "prayer_request"("churchId", "category");

-- CreateIndex
CREATE INDEX "prayer_request_churchId_status_idx" ON "prayer_request"("churchId", "status");

-- CreateIndex
CREATE INDEX "service_schedule_churchId_branchId_idx" ON "service_schedule"("churchId", "branchId");

-- CreateIndex
CREATE INDEX "attendance_churchId_serviceDate_idx" ON "attendance"("churchId", "serviceDate");

-- CreateIndex
CREATE INDEX "asset_churchId_status_idx" ON "asset"("churchId", "status");

-- CreateIndex
CREATE INDEX "asset_branchId_idx" ON "asset"("branchId");

-- CreateIndex
CREATE INDEX "announcement_churchId_branchId_idx" ON "announcement"("churchId", "branchId");

-- CreateIndex
CREATE INDEX "announcement_churchId_category_idx" ON "announcement"("churchId", "category");

-- CreateIndex
CREATE INDEX "announcement_churchId_status_idx" ON "announcement"("churchId", "status");

-- CreateIndex
CREATE INDEX "announcement_publishDate_idx" ON "announcement"("publishDate");

-- CreateIndex
CREATE UNIQUE INDEX "church_subscription_churchId_key" ON "church_subscription"("churchId");

-- CreateIndex
CREATE INDEX "church_subscription_churchId_status_idx" ON "church_subscription"("churchId", "status");

-- CreateIndex
CREATE INDEX "church_subscription_status_endDate_idx" ON "church_subscription"("status", "endDate");

-- CreateIndex
CREATE INDEX "church_subscription_plan_status_idx" ON "church_subscription"("plan", "status");

-- CreateIndex
CREATE INDEX "user_subscription_userId_status_idx" ON "user_subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "user_subscription_status_endDate_idx" ON "user_subscription"("status", "endDate");

-- CreateIndex
CREATE INDEX "user_subscription_plan_status_idx" ON "user_subscription"("plan", "status");

-- CreateIndex
CREATE INDEX "log_level_timestamp_idx" ON "log"("level", "timestamp");

-- CreateIndex
CREATE INDEX "log_source_level_timestamp_idx" ON "log"("source", "level", "timestamp");

-- CreateIndex
CREATE INDEX "log_environment_timestamp_idx" ON "log"("environment", "timestamp");

-- CreateIndex
CREATE INDEX "payment_churchId_status_idx" ON "payment"("churchId", "status");

-- CreateIndex
CREATE INDEX "report_churchId_branchId_idx" ON "report"("churchId", "branchId");

-- CreateIndex
CREATE INDEX "report_churchId_status_idx" ON "report"("churchId", "status");

-- CreateIndex
CREATE INDEX "report_churchId_type_idx" ON "report"("churchId", "type");

-- CreateIndex
CREATE INDEX "report_createdBy_idx" ON "report"("createdBy");

-- CreateIndex
CREATE INDEX "report_status_createdAt_idx" ON "report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "report_generatedAt_idx" ON "report"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "report_data_reportId_key" ON "report_data"("reportId");

-- CreateIndex
CREATE INDEX "milestone_churchId_branchId_idx" ON "milestone"("churchId", "branchId");

-- CreateIndex
CREATE INDEX "milestone_churchId_category_idx" ON "milestone"("churchId", "category");

-- CreateIndex
CREATE INDEX "milestone_churchId_level_idx" ON "milestone"("churchId", "level");

-- CreateIndex
CREATE INDEX "milestone_churchId_isActive_idx" ON "milestone"("churchId", "isActive");

-- CreateIndex
CREATE INDEX "milestone_category_order_idx" ON "milestone"("category", "order");

-- CreateIndex
CREATE INDEX "milestone_level_order_idx" ON "milestone"("level", "order");

-- CreateIndex
CREATE INDEX "message_template_churchId_isActive_idx" ON "message_template"("churchId", "isActive");

-- CreateIndex
CREATE INDEX "message_template_churchId_type_isActive_idx" ON "message_template"("churchId", "type", "isActive");

-- CreateIndex
CREATE INDEX "message_template_churchId_category_isActive_idx" ON "message_template"("churchId", "category", "isActive");

-- CreateIndex
CREATE INDEX "message_template_createdBy_idx" ON "message_template"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "message_template_churchId_name_key" ON "message_template"("churchId", "name");

-- CreateIndex
CREATE INDEX "message_churchId_branchId_idx" ON "message"("churchId", "branchId");

-- CreateIndex
CREATE INDEX "message_churchId_status_idx" ON "message"("churchId", "status");

-- CreateIndex
CREATE INDEX "message_churchId_type_idx" ON "message"("churchId", "type");

-- CreateIndex
CREATE INDEX "message_scheduleDate_status_idx" ON "message"("scheduleDate", "status");

-- CreateIndex
CREATE INDEX "message_createdBy_idx" ON "message"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "message_delivery_stats_messageId_key" ON "message_delivery_stats"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "message_recipient_recipientId_key" ON "message_recipient"("recipientId");

-- CreateIndex
CREATE INDEX "message_recipient_churchId_isActive_idx" ON "message_recipient"("churchId", "isActive");

-- CreateIndex
CREATE INDEX "message_recipient_churchId_type_isActive_idx" ON "message_recipient"("churchId", "type", "isActive");

-- CreateIndex
CREATE INDEX "message_recipient_branchId_idx" ON "message_recipient"("branchId");

-- CreateIndex
CREATE INDEX "message_recipient_targetModel_targetId_idx" ON "message_recipient"("targetModel", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "message_recipient_churchId_recipientId_key" ON "message_recipient"("churchId", "recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "recipient_criteria_recipientId_key" ON "recipient_criteria"("recipientId");

-- CreateIndex
CREATE INDEX "disciple_churchId_branchId_idx" ON "disciple"("churchId", "branchId");

-- CreateIndex
CREATE INDEX "disciple_churchId_memberId_idx" ON "disciple"("churchId", "memberId");

-- CreateIndex
CREATE INDEX "disciple_churchId_mentorId_idx" ON "disciple"("churchId", "mentorId");

-- CreateIndex
CREATE INDEX "disciple_churchId_status_idx" ON "disciple"("churchId", "status");

-- CreateIndex
CREATE INDEX "disciple_churchId_currentLevel_idx" ON "disciple"("churchId", "currentLevel");

-- CreateIndex
CREATE INDEX "disciple_startDate_idx" ON "disciple"("startDate");

-- CreateIndex
CREATE INDEX "content_churchId_type_idx" ON "content"("churchId", "type");

-- CreateIndex
CREATE INDEX "_DiscipleProgressToMilestone_B_index" ON "_DiscipleProgressToMilestone"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contact" ADD CONSTRAINT "emergency_contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_details" ADD CONSTRAINT "member_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pastor_details" ADD CONSTRAINT "pastor_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pastor_assignment" ADD CONSTRAINT "pastor_assignment_pastorDetailsId_fkey" FOREIGN KEY ("pastorDetailsId") REFERENCES "pastor_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bishop_details" ADD CONSTRAINT "bishop_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_details" ADD CONSTRAINT "staff_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_details" ADD CONSTRAINT "volunteer_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_schedule" ADD CONSTRAINT "availability_schedule_volunteerDetailsId_fkey" FOREIGN KEY ("volunteerDetailsId") REFERENCES "volunteer_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_role" ADD CONSTRAINT "volunteer_role_volunteerDetailsId_fkey" FOREIGN KEY ("volunteerDetailsId") REFERENCES "volunteer_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_check" ADD CONSTRAINT "background_check_volunteerDetailsId_fkey" FOREIGN KEY ("volunteerDetailsId") REFERENCES "volunteer_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_details" ADD CONSTRAINT "admin_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_details" ADD CONSTRAINT "visitor_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_pastorId_fkey" FOREIGN KEY ("pastorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_member" ADD CONSTRAINT "department_member_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_member" ADD CONSTRAINT "department_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_category" ADD CONSTRAINT "budget_category_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_activity" ADD CONSTRAINT "department_activity_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_activity" ADD CONSTRAINT "department_activity_organizedBy_fkey" FOREIGN KEY ("organizedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_goal" ADD CONSTRAINT "department_goal_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_goal" ADD CONSTRAINT "department_goal_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_activity" ADD CONSTRAINT "group_activity_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_activity" ADD CONSTRAINT "group_activity_organizedBy_fkey" FOREIGN KEY ("organizedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_goal" ADD CONSTRAINT "group_goal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_goal" ADD CONSTRAINT "group_goal_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_summary" ADD CONSTRAINT "attendance_summary_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_groupActivityId_fkey" FOREIGN KEY ("groupActivityId") REFERENCES "group_activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_attendanceSummaryId_fkey" FOREIGN KEY ("attendanceSummaryId") REFERENCES "attendance_summary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering" ADD CONSTRAINT "offering_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering" ADD CONSTRAINT "offering_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering" ADD CONSTRAINT "offering_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pledge" ADD CONSTRAINT "pledge_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pledge" ADD CONSTRAINT "pledge_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pledge" ADD CONSTRAINT "pledge_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_request" ADD CONSTRAINT "prayer_request_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_request" ADD CONSTRAINT "prayer_request_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_request" ADD CONSTRAINT "prayer_request_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_schedule" ADD CONSTRAINT "service_schedule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_schedule" ADD CONSTRAINT "service_schedule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_takenBy_fkey" FOREIGN KEY ("takenBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_record" ADD CONSTRAINT "maintenance_record_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "church_subscription" ADD CONSTRAINT "church_subscription_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_data" ADD CONSTRAINT "report_data_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_count" ADD CONSTRAINT "department_count_reportDataId_fkey" FOREIGN KEY ("reportDataId") REFERENCES "report_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_template" ADD CONSTRAINT "message_template_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_template" ADD CONSTRAINT "message_template_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_delivery_stats" ADD CONSTRAINT "message_delivery_stats_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_recipient" ADD CONSTRAINT "message_recipient_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_recipient" ADD CONSTRAINT "message_recipient_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_recipient" ADD CONSTRAINT "message_recipient_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipient_criteria" ADD CONSTRAINT "recipient_criteria_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "message_recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciple" ADD CONSTRAINT "disciple_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciple" ADD CONSTRAINT "disciple_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciple" ADD CONSTRAINT "disciple_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciple" ADD CONSTRAINT "disciple_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciple_progress" ADD CONSTRAINT "disciple_progress_discipleId_fkey" FOREIGN KEY ("discipleId") REFERENCES "disciple"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciple_progress" ADD CONSTRAINT "disciple_progress_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_progress" ADD CONSTRAINT "milestone_progress_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_progress" ADD CONSTRAINT "milestone_progress_discipleProgressId_fkey" FOREIGN KEY ("discipleProgressId") REFERENCES "disciple_progress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscipleProgressToMilestone" ADD CONSTRAINT "_DiscipleProgressToMilestone_A_fkey" FOREIGN KEY ("A") REFERENCES "disciple_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscipleProgressToMilestone" ADD CONSTRAINT "_DiscipleProgressToMilestone_B_fkey" FOREIGN KEY ("B") REFERENCES "milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
