/*
  Warnings:

  - You are about to drop the column `organizationRoles` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "session" ADD COLUMN     "activeMemberRole" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "organizationRoles",
DROP COLUMN "position";
