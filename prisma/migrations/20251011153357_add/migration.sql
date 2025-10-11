-- DropForeignKey
ALTER TABLE "public"."log" DROP CONSTRAINT "log_organizationId_fkey";

-- AlterTable
ALTER TABLE "log" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
