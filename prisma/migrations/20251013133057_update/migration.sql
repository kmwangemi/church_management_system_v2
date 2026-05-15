-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "churchSize" TEXT,
ADD COLUMN     "denomination" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "establishedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mission" TEXT,
ADD COLUMN     "numberOfBranches" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'Active',
ADD COLUMN     "values" TEXT[],
ADD COLUMN     "vision" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "organization_subscription" ALTER COLUMN "plan" SET DEFAULT 'BASIC';
