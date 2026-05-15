/*
  Warnings:

  - You are about to drop the column `churchSize` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `denomination` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `establishedDate` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `isSuspended` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfBranches` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `organization` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."organization_churchSize_idx";

-- DropIndex
DROP INDEX "public"."organization_denomination_idx";

-- DropIndex
DROP INDEX "public"."organization_email_key";

-- DropIndex
DROP INDEX "public"."organization_isSuspended_isDeleted_idx";

-- DropIndex
DROP INDEX "public"."organization_phoneNumber_key";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "churchSize",
DROP COLUMN "denomination",
DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "establishedDate",
DROP COLUMN "isDeleted",
DROP COLUMN "isSuspended",
DROP COLUMN "metadata",
DROP COLUMN "numberOfBranches",
DROP COLUMN "phoneNumber",
DROP COLUMN "website";

-- CreateTable
CREATE TABLE "organization_metadata" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
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
    "settings" JSONB,
    "features" JSONB,
    "integrations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_metadata_organizationId_key" ON "organization_metadata"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_metadata_email_key" ON "organization_metadata"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_metadata_phoneNumber_key" ON "organization_metadata"("phoneNumber");

-- CreateIndex
CREATE INDEX "organization_metadata_organizationId_idx" ON "organization_metadata"("organizationId");

-- CreateIndex
CREATE INDEX "organization_metadata_denomination_idx" ON "organization_metadata"("denomination");

-- CreateIndex
CREATE INDEX "organization_metadata_churchSize_idx" ON "organization_metadata"("churchSize");

-- CreateIndex
CREATE INDEX "organization_metadata_isSuspended_isDeleted_idx" ON "organization_metadata"("isSuspended", "isDeleted");

-- AddForeignKey
ALTER TABLE "organization_metadata" ADD CONSTRAINT "organization_metadata_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
