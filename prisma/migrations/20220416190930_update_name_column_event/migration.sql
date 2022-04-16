/*
  Warnings:

  - You are about to drop the column `event_data` on the `events` table. All the data in the column will be lost.
  - Added the required column `event_date` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `events` DROP COLUMN `event_data`,
    ADD COLUMN `event_date` INTEGER NOT NULL;
