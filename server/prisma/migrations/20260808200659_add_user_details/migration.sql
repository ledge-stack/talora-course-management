/*
  Warnings:

  - A unique constraint covering the columns `[registration_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone_number` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration_number` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "registration_number" TEXT NOT NULL,
ADD COLUMN     "verification_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_registration_number_key" ON "users"("registration_number");
