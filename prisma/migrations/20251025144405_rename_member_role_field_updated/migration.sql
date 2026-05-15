/*
  Warnings:

  - You are about to drop the column `organizationRoles` on the `member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "member" DROP COLUMN "organizationRoles",
ADD COLUMN     "role" "OrganizationRole"[] DEFAULT ARRAY['MEMBER']::"OrganizationRole"[];
