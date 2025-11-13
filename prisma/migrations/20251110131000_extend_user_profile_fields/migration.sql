-- AlterTable
ALTER TABLE "User" ADD COLUMN "address" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "postalCode" TEXT,
ADD COLUMN "emergencyContact" TEXT,
ADD COLUMN "emergencyPhone" TEXT,
ADD COLUMN "position" TEXT,
ADD COLUMN "department" TEXT,
ADD COLUMN "hireDate" TIMESTAMP(3),
ADD COLUMN "nationality" TEXT,
ADD COLUMN "idNumber" TEXT;
