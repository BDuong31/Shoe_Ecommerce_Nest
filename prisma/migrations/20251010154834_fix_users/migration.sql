/*
  Warnings:

  - You are about to drop the column `fullname` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gerder` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('male', 'female', 'other');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "fullname",
DROP COLUMN "username",
ADD COLUMN     "first_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "gerder" "UserGender" NOT NULL,
ADD COLUMN     "last_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "salt" VARCHAR(50) NOT NULL;
