/*
  Warnings:

  - The `organizationRoles` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."user_globalRole_organizationRoles_status_idx";

-- AlterTable
ALTER TABLE "member" ADD COLUMN     "position" TEXT DEFAULT 'member';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "organizationRoles",
ADD COLUMN     "organizationRoles" TEXT[];

-- CreateIndex
CREATE INDEX "user_globalRole_status_idx" ON "user"("globalRole", "status");
