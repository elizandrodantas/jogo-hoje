/*
  Warnings:

  - You are about to drop the column `mailTask` on the `otps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `otps` DROP COLUMN `mailTask`,
    ADD COLUMN `workId` VARCHAR(191) NULL DEFAULT '';
