/*
  Warnings:

  - Made the column `ownerId` on table `Activity` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `Checklist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `Note` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `TodoList` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Checklist" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TodoList" ALTER COLUMN "ownerId" SET NOT NULL;
