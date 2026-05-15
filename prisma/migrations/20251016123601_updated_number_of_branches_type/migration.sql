/*
  Warnings:

  - The `numberOfBranches` column on the `organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "organization" DROP COLUMN "numberOfBranches",
ADD COLUMN     "numberOfBranches" INTEGER;
