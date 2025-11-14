/*
  Warnings:

  - The values [NEW,TRANSFER] on the enum `MembershipStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `occupation` on the `member_details` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "AdminAccessLevel" ADD VALUE 'GLOBAL';

-- AlterEnum
BEGIN;
CREATE TYPE "MembershipStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DECEASED');
ALTER TABLE "public"."member_details" ALTER COLUMN "membershipStatus" DROP DEFAULT;
ALTER TABLE "member_details" ALTER COLUMN "membershipStatus" TYPE "MembershipStatus_new" USING ("membershipStatus"::text::"MembershipStatus_new");
ALTER TYPE "MembershipStatus" RENAME TO "MembershipStatus_old";
ALTER TYPE "MembershipStatus_new" RENAME TO "MembershipStatus";
DROP TYPE "public"."MembershipStatus_old";
ALTER TABLE "member_details" ALTER COLUMN "membershipStatus" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "member" ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "member_details" DROP COLUMN "occupation";

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
