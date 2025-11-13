-- AlterTable User - Add profile fields
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "birthDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "description" TEXT;
ALTER TABLE "User" ADD COLUMN "profilePicture" TEXT;

-- Migrate existing name field to firstName/lastName if exists
UPDATE "User" SET 
  "firstName" = SPLIT_PART("name", ' ', 1),
  "lastName" = CASE 
    WHEN SPLIT_PART("name", ' ', 2) <> '' THEN SPLIT_PART("name", ' ', 2)
    ELSE NULL
  END
WHERE "name" IS NOT NULL;
