/*
  Warnings:

  - You are about to drop the column `active` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `active`,
    ADD COLUMN `account_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `last_seen` INTEGER NULL;
