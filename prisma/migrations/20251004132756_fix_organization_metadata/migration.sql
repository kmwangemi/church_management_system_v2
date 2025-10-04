/*
  Warnings:

  - You are about to drop the column `createdBy` on the `organization` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ORGANIZATIONUserRole" ADD VALUE 'OWNER';

-- DropForeignKey
ALTER TABLE "public"."organization" DROP CONSTRAINT "organization_createdBy_fkey";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "createdBy";
