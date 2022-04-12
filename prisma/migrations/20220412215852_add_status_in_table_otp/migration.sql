/*
  Warnings:

  - You are about to drop the column `mailSend` on the `otps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `otps` DROP COLUMN `mailSend`,
    ADD COLUMN `status` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `workStatus` BOOLEAN NULL DEFAULT false;
