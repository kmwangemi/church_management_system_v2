/*
  Warnings:

  - You are about to drop the `organization_metadata` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `metadata` to the `organization` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."organization_metadata" DROP CONSTRAINT "organization_metadata_organizationId_fkey";

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "metadata" JSONB NOT NULL;

-- DropTable
DROP TABLE "public"."organization_metadata";
