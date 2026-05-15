/*
  Warnings:

  - Made the column `slug` on table `organization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "ChurchPlan" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "church_subscription" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "slug" SET NOT NULL;
