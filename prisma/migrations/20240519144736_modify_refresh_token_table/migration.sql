/*
  Warnings:

  - You are about to drop the column `hashed_token` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `refresh_token` table. All the data in the column will be lost.
  - Added the required column `token` to the `refresh_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_agent` to the `refresh_token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refresh_token" DROP COLUMN "hashed_token",
DROP COLUMN "revoked",
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "user_agent" TEXT NOT NULL;
