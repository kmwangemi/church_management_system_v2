/*
  Warnings:

  - You are about to drop the column `role` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `isMember` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `isStaff` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `isVolunteer` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - Added the required column `position` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'MEMBER', 'STAFF', 'VOLUNTEER', 'ADMIN', 'VISITOR');

-- DropIndex
DROP INDEX "public"."user_role_status_idx";

-- AlterTable
ALTER TABLE "member" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "isMember",
DROP COLUMN "isStaff",
DROP COLUMN "isVolunteer",
DROP COLUMN "role",
ADD COLUMN     "globalRole" "GlobalRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "organizationRoles" "OrganizationRole"[] DEFAULT ARRAY[]::"OrganizationRole"[],
ADD COLUMN     "position" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."ORGANIZATIONUserRole";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateIndex
CREATE INDEX "user_globalRole_organizationRoles_status_idx" ON "user"("globalRole", "organizationRoles", "status");
