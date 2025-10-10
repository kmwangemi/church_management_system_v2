/*
  Warnings:

  - The values [BRANCH] on the enum `AdminAccessLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [BRANCH] on the enum `AnnouncementTarget` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `branchId` on the `activity` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `assignedBranches` on the `admin_details` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `announcement` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `asset` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `branchIds` on the `bishop_details` table. All the data in the column will be lost.
  - You are about to drop the column `currentBranches` on the `church_subscription` table. All the data in the column will be lost.
  - You are about to drop the column `maxBranches` on the `church_subscription` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `department` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `disciple` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `disciple_progress` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `message` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `message_recipient` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `milestone` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `offering` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `pastor_assignment` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `pledge` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `prayer_request` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `report` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `service_schedule` table. All the data in the column will be lost.
  - You are about to drop the `branch` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[teamId]` on the table `address` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamId` to the `activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `offering` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `pledge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `prayer_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `service_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AdminAccessLevel_new" AS ENUM ('NATIONAL', 'REGIONAL', 'TEAM');
ALTER TABLE "public"."admin_details" ALTER COLUMN "accessLevel" DROP DEFAULT;
ALTER TABLE "admin_details" ALTER COLUMN "accessLevel" TYPE "AdminAccessLevel_new" USING ("accessLevel"::text::"AdminAccessLevel_new");
ALTER TYPE "AdminAccessLevel" RENAME TO "AdminAccessLevel_old";
ALTER TYPE "AdminAccessLevel_new" RENAME TO "AdminAccessLevel";
DROP TYPE "public"."AdminAccessLevel_old";
ALTER TABLE "admin_details" ALTER COLUMN "accessLevel" SET DEFAULT 'NATIONAL';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AnnouncementTarget_new" AS ENUM ('ALL', 'TEAM', 'DEPARTMENT', 'GROUP');
ALTER TYPE "AnnouncementTarget" RENAME TO "AnnouncementTarget_old";
ALTER TYPE "AnnouncementTarget_new" RENAME TO "AnnouncementTarget";
DROP TYPE "public"."AnnouncementTarget_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."activity" DROP CONSTRAINT "activity_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."address" DROP CONSTRAINT "address_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."announcement" DROP CONSTRAINT "announcement_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."asset" DROP CONSTRAINT "asset_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance" DROP CONSTRAINT "attendance_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."branch" DROP CONSTRAINT "branch_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."branch" DROP CONSTRAINT "branch_pastorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."content" DROP CONSTRAINT "content_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."disciple" DROP CONSTRAINT "disciple_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."disciple_progress" DROP CONSTRAINT "disciple_progress_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event" DROP CONSTRAINT "event_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."member" DROP CONSTRAINT "member_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message" DROP CONSTRAINT "message_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_recipient" DROP CONSTRAINT "message_recipient_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."milestone" DROP CONSTRAINT "milestone_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."offering" DROP CONSTRAINT "offering_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."pledge" DROP CONSTRAINT "pledge_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."prayer_request" DROP CONSTRAINT "prayer_request_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."report" DROP CONSTRAINT "report_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_schedule" DROP CONSTRAINT "service_schedule_branchId_fkey";

-- DropIndex
DROP INDEX "public"."activity_churchId_branchId_idx";

-- DropIndex
DROP INDEX "public"."address_branchId_key";

-- DropIndex
DROP INDEX "public"."announcement_churchId_branchId_idx";

-- DropIndex
DROP INDEX "public"."asset_branchId_idx";

-- DropIndex
DROP INDEX "public"."department_churchId_idx";

-- DropIndex
DROP INDEX "public"."disciple_churchId_branchId_idx";

-- DropIndex
DROP INDEX "public"."event_branchId_idx";

-- DropIndex
DROP INDEX "public"."group_churchId_idx";

-- DropIndex
DROP INDEX "public"."member_branchId_idx";

-- DropIndex
DROP INDEX "public"."message_churchId_branchId_idx";

-- DropIndex
DROP INDEX "public"."message_recipient_branchId_idx";

-- DropIndex
DROP INDEX "public"."milestone_churchId_branchId_idx";

-- DropIndex
DROP INDEX "public"."prayer_request_churchId_branchId_idx";

-- DropIndex
DROP INDEX "public"."report_churchId_branchId_idx";

-- DropIndex
DROP INDEX "public"."service_schedule_churchId_branchId_idx";

-- AlterTable
ALTER TABLE "activity" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "address" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "admin_details" DROP COLUMN "assignedBranches",
ADD COLUMN     "assignedTeams" TEXT[];

-- AlterTable
ALTER TABLE "announcement" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "asset" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "bishop_details" DROP COLUMN "branchIds",
ADD COLUMN     "teamIds" TEXT[];

-- AlterTable
ALTER TABLE "church_subscription" DROP COLUMN "currentBranches",
DROP COLUMN "maxBranches",
ADD COLUMN     "currentTeams" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxTeams" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "content" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "department" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "disciple" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "disciple_progress" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "event" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invitation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "member" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "message" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "message_recipient" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "milestone" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "offering" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "metadata" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pastor_assignment" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "pledge" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "prayer_request" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "report" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "service_schedule" DROP COLUMN "branchId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."branch";

-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "capacity" INTEGER,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "establishedDate" TIMESTAMP(3),
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "pastorId" TEXT,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_organizationId_isActive_idx" ON "team"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "team_organizationId_isDeleted_idx" ON "team"("organizationId", "isDeleted");

-- CreateIndex
CREATE INDEX "team_pastorId_idx" ON "team"("pastorId");

-- CreateIndex
CREATE INDEX "activity_churchId_teamId_idx" ON "activity"("churchId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "address_teamId_key" ON "address"("teamId");

-- CreateIndex
CREATE INDEX "announcement_churchId_teamId_idx" ON "announcement"("churchId", "teamId");

-- CreateIndex
CREATE INDEX "asset_teamId_idx" ON "asset"("teamId");

-- CreateIndex
CREATE INDEX "department_churchId_teamId_idx" ON "department"("churchId", "teamId");

-- CreateIndex
CREATE INDEX "department_teamId_isActive_idx" ON "department"("teamId", "isActive");

-- CreateIndex
CREATE INDEX "disciple_churchId_teamId_idx" ON "disciple"("churchId", "teamId");

-- CreateIndex
CREATE INDEX "event_teamId_idx" ON "event"("teamId");

-- CreateIndex
CREATE INDEX "group_churchId_teamId_idx" ON "group"("churchId", "teamId");

-- CreateIndex
CREATE INDEX "group_teamId_isActive_idx" ON "group"("teamId", "isActive");

-- CreateIndex
CREATE INDEX "member_teamId_idx" ON "member"("teamId");

-- CreateIndex
CREATE INDEX "message_churchId_teamId_idx" ON "message"("churchId", "teamId");

-- CreateIndex
CREATE INDEX "message_recipient_teamId_idx" ON "message_recipient"("teamId");

-- CreateIndex
CREATE INDEX "milestone_churchId_teamId_idx" ON "milestone"("churchId", "teamId");

-- CreateIndex
CREATE INDEX "prayer_request_churchId_teamId_idx" ON "prayer_request"("churchId", "teamId");

-- CreateIndex
CREATE INDEX "report_churchId_teamId_idx" ON "report"("churchId", "teamId");

-- CreateIndex
CREATE INDEX "service_schedule_churchId_teamId_idx" ON "service_schedule"("churchId", "teamId");

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_pastorId_fkey" FOREIGN KEY ("pastorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offering" ADD CONSTRAINT "offering_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pledge" ADD CONSTRAINT "pledge_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_request" ADD CONSTRAINT "prayer_request_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_schedule" ADD CONSTRAINT "service_schedule_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_recipient" ADD CONSTRAINT "message_recipient_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciple" ADD CONSTRAINT "disciple_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciple_progress" ADD CONSTRAINT "disciple_progress_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
