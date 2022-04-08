/*
  Warnings:

  - You are about to alter the column `expireIn` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `MediumInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `otps` MODIFY `expireIn` INTEGER NOT NULL;
