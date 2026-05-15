/*
  Warnings:

  - You are about to drop the column `churchId` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `pastorId` on the `team` table. All the data in the column will be lost.
  - You are about to drop the `_DiscipleProgressToMilestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `announcement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendance_record` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendance_summary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budget_category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `church_subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `department_activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `department_count` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `department_goal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `department_member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `disciple` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `disciple_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_goal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `maintenance_record` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_delivery_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_recipient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_template` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `milestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `milestone_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `offering` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pledge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prayer_request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recipient_criteria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service_schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_subscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organizationId]` on the table `address` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."_DiscipleProgressToMilestone" DROP CONSTRAINT "_DiscipleProgressToMilestone_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DiscipleProgressToMilestone" DROP CONSTRAINT "_DiscipleProgressToMilestone_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."activity" DROP CONSTRAINT "activity_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."activity" DROP CONSTRAINT "activity_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."address" DROP CONSTRAINT "address_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."announcement" DROP CONSTRAINT "announcement_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."announcement" DROP CONSTRAINT "announcement_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."announcement" DROP CONSTRAINT "announcement_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."asset" DROP CONSTRAINT "asset_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."asset" DROP CONSTRAINT "asset_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance" DROP CONSTRAINT "attendance_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance" DROP CONSTRAINT "attendance_takenBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance" DROP CONSTRAINT "attendance_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance_record" DROP CONSTRAINT "attendance_record_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance_record" DROP CONSTRAINT "attendance_record_attendanceSummaryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance_record" DROP CONSTRAINT "attendance_record_groupActivityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance_record" DROP CONSTRAINT "attendance_record_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance_summary" DROP CONSTRAINT "attendance_summary_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."budget_category" DROP CONSTRAINT "budget_category_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."church_subscription" DROP CONSTRAINT "church_subscription_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."content" DROP CONSTRAINT "content_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."content" DROP CONSTRAINT "content_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."department" DROP CONSTRAINT "department_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."department" DROP CONSTRAINT "department_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."department" DROP CONSTRAINT "department_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."department_activity" DROP CONSTRAINT "department_activity_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."department_activity" DROP CONSTRAINT "department_activity_organizedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."department_count" DROP CONSTRAINT "department_count_reportDataId_fkey";

-- DropForeignKey
ALTER TABLE "public"."department_goal" DROP CONSTRAINT "department_goal_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."department_goal" DROP CONSTRAINT "department_goal_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."department_member" DROP CONSTRAINT "department_member_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."department_member" DROP CONSTRAINT "department_member_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."disciple" DROP CONSTRAINT "disciple_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."disciple" DROP CONSTRAINT "disciple_memberId_fkey";

-- DropForeignKey
ALTER TABLE "public"."disciple" DROP CONSTRAINT "disciple_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."disciple" DROP CONSTRAINT "disciple_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."disciple_progress" DROP CONSTRAINT "disciple_progress_discipleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."disciple_progress" DROP CONSTRAINT "disciple_progress_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event" DROP CONSTRAINT "event_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event" DROP CONSTRAINT "event_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."expense" DROP CONSTRAINT "expense_approvedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."expense" DROP CONSTRAINT "expense_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."group" DROP CONSTRAINT "group_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."group" DROP CONSTRAINT "group_leaderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."group" DROP CONSTRAINT "group_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_activity" DROP CONSTRAINT "group_activity_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_activity" DROP CONSTRAINT "group_activity_organizedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_goal" DROP CONSTRAINT "group_goal_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_goal" DROP CONSTRAINT "group_goal_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_member" DROP CONSTRAINT "group_member_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_member" DROP CONSTRAINT "group_member_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."log" DROP CONSTRAINT "log_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."log" DROP CONSTRAINT "log_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."maintenance_record" DROP CONSTRAINT "maintenance_record_assetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."member" DROP CONSTRAINT "member_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message" DROP CONSTRAINT "message_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message" DROP CONSTRAINT "message_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."message" DROP CONSTRAINT "message_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message" DROP CONSTRAINT "message_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_delivery_stats" DROP CONSTRAINT "message_delivery_stats_messageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_recipient" DROP CONSTRAINT "message_recipient_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_recipient" DROP CONSTRAINT "message_recipient_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_recipient" DROP CONSTRAINT "message_recipient_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_template" DROP CONSTRAINT "message_template_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_template" DROP CONSTRAINT "message_template_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."milestone" DROP CONSTRAINT "milestone_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."milestone" DROP CONSTRAINT "milestone_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."milestone_progress" DROP CONSTRAINT "milestone_progress_discipleProgressId_fkey";

-- DropForeignKey
ALTER TABLE "public"."milestone_progress" DROP CONSTRAINT "milestone_progress_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "public"."offering" DROP CONSTRAINT "offering_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."offering" DROP CONSTRAINT "offering_memberId_fkey";

-- DropForeignKey
ALTER TABLE "public"."offering" DROP CONSTRAINT "offering_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."pledge" DROP CONSTRAINT "pledge_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."pledge" DROP CONSTRAINT "pledge_memberId_fkey";

-- DropForeignKey
ALTER TABLE "public"."pledge" DROP CONSTRAINT "pledge_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."prayer_request" DROP CONSTRAINT "prayer_request_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."prayer_request" DROP CONSTRAINT "prayer_request_submittedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."prayer_request" DROP CONSTRAINT "prayer_request_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."recipient_criteria" DROP CONSTRAINT "recipient_criteria_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."report" DROP CONSTRAINT "report_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."report" DROP CONSTRAINT "report_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."report" DROP CONSTRAINT "report_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."report_data" DROP CONSTRAINT "report_data_reportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_schedule" DROP CONSTRAINT "service_schedule_churchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_schedule" DROP CONSTRAINT "service_schedule_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."team" DROP CONSTRAINT "team_pastorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_subscription" DROP CONSTRAINT "user_subscription_userId_fkey";

-- DropIndex
DROP INDEX "public"."address_churchId_key";

-- DropIndex
DROP INDEX "public"."member_teamId_idx";

-- DropIndex
DROP INDEX "public"."team_organizationId_isActive_idx";

-- DropIndex
DROP INDEX "public"."team_organizationId_isDeleted_idx";

-- DropIndex
DROP INDEX "public"."team_pastorId_idx";

-- AlterTable
ALTER TABLE "address" DROP COLUMN "churchId",
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "member" DROP COLUMN "teamId";

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "activeTeamId" TEXT;

-- AlterTable
ALTER TABLE "team" DROP COLUMN "pastorId",
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."_DiscipleProgressToMilestone";

-- DropTable
DROP TABLE "public"."activity";

-- DropTable
DROP TABLE "public"."announcement";

-- DropTable
DROP TABLE "public"."asset";

-- DropTable
DROP TABLE "public"."attendance";

-- DropTable
DROP TABLE "public"."attendance_record";

-- DropTable
DROP TABLE "public"."attendance_summary";

-- DropTable
DROP TABLE "public"."budget_category";

-- DropTable
DROP TABLE "public"."church_subscription";

-- DropTable
DROP TABLE "public"."content";

-- DropTable
DROP TABLE "public"."department";

-- DropTable
DROP TABLE "public"."department_activity";

-- DropTable
DROP TABLE "public"."department_count";

-- DropTable
DROP TABLE "public"."department_goal";

-- DropTable
DROP TABLE "public"."department_member";

-- DropTable
DROP TABLE "public"."disciple";

-- DropTable
DROP TABLE "public"."disciple_progress";

-- DropTable
DROP TABLE "public"."event";

-- DropTable
DROP TABLE "public"."expense";

-- DropTable
DROP TABLE "public"."group";

-- DropTable
DROP TABLE "public"."group_activity";

-- DropTable
DROP TABLE "public"."group_goal";

-- DropTable
DROP TABLE "public"."group_member";

-- DropTable
DROP TABLE "public"."log";

-- DropTable
DROP TABLE "public"."maintenance_record";

-- DropTable
DROP TABLE "public"."message";

-- DropTable
DROP TABLE "public"."message_delivery_stats";

-- DropTable
DROP TABLE "public"."message_recipient";

-- DropTable
DROP TABLE "public"."message_template";

-- DropTable
DROP TABLE "public"."milestone";

-- DropTable
DROP TABLE "public"."milestone_progress";

-- DropTable
DROP TABLE "public"."offering";

-- DropTable
DROP TABLE "public"."payment";

-- DropTable
DROP TABLE "public"."pledge";

-- DropTable
DROP TABLE "public"."prayer_request";

-- DropTable
DROP TABLE "public"."recipient_criteria";

-- DropTable
DROP TABLE "public"."report";

-- DropTable
DROP TABLE "public"."report_data";

-- DropTable
DROP TABLE "public"."service_schedule";

-- DropTable
DROP TABLE "public"."user_subscription";

-- CreateTable
CREATE TABLE "teamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3),

    CONSTRAINT "teamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "address_organizationId_key" ON "address"("organizationId");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
