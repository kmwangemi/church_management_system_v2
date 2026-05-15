/*
  Warnings:

  - You are about to drop the column `role` on the `member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "member" DROP COLUMN "role",
ADD COLUMN     "organizationRoles" "OrganizationRole"[] DEFAULT ARRAY['MEMBER']::"OrganizationRole"[];
