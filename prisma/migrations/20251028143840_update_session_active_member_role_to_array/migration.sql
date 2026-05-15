/*
  Warnings:

  - The `activeMemberRole` column on the `session` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "session" DROP COLUMN "activeMemberRole",
ADD COLUMN     "activeMemberRole" TEXT[] DEFAULT ARRAY[]::TEXT[];
