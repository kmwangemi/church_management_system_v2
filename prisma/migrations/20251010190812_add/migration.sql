-- CreateEnum
CREATE TYPE "OrganizationPlan" AS ENUM ('BASIC', 'MINISTRY', 'CATHEDRAL', 'CUSTOM');

-- DropEnum
DROP TYPE "public"."ChurchPlan";

-- CreateTable
CREATE TABLE "organization_subscription" (
    "id" TEXT NOT NULL,
    "plan" "OrganizationPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "invoiceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxUsers" INTEGER,
    "maxTeams" INTEGER DEFAULT 1,
    "maxSmallGroups" INTEGER,
    "currentUsers" INTEGER NOT NULL DEFAULT 0,
    "currentTeams" INTEGER NOT NULL DEFAULT 0,
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
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "organization_subscription_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "organization_subscription_organizationId_key" ON "organization_subscription"("organizationId");

-- CreateIndex
CREATE INDEX "organization_subscription_organizationId_status_idx" ON "organization_subscription"("organizationId", "status");

-- CreateIndex
CREATE INDEX "organization_subscription_status_endDate_idx" ON "organization_subscription"("status", "endDate");

-- CreateIndex
CREATE INDEX "organization_subscription_plan_status_idx" ON "organization_subscription"("plan", "status");

-- CreateIndex
CREATE INDEX "user_subscription_userId_status_idx" ON "user_subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "user_subscription_status_endDate_idx" ON "user_subscription"("status", "endDate");

-- CreateIndex
CREATE INDEX "user_subscription_plan_status_idx" ON "user_subscription"("plan", "status");

-- AddForeignKey
ALTER TABLE "organization_subscription" ADD CONSTRAINT "organization_subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
