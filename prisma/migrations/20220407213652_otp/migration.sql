/*
  Warnings:

  - Added the required column `taskId` to the `otps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `otps` ADD COLUMN `taskId` VARCHAR(191) NOT NULL;
