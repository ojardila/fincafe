/*
  Warnings:

  - You are about to drop the `Parcel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParcelCrop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ParcelCrop" DROP CONSTRAINT "ParcelCrop_cropTypeId_fkey";

-- DropForeignKey
ALTER TABLE "ParcelCrop" DROP CONSTRAINT "ParcelCrop_parcelId_fkey";

-- DropForeignKey
ALTER TABLE "ParcelCrop" DROP CONSTRAINT "ParcelCrop_varietyId_fkey";

-- DropTable
DROP TABLE "Parcel";

-- DropTable
DROP TABLE "ParcelCrop";

-- CreateTable
CREATE TABLE "Plot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalArea" DOUBLE PRECISION NOT NULL,
    "department" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "map" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlotCrop" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "cropTypeId" TEXT NOT NULL,
    "varietyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlotCrop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlotCrop_plotId_cropTypeId_varietyId_key" ON "PlotCrop"("plotId", "cropTypeId", "varietyId");

-- AddForeignKey
ALTER TABLE "PlotCrop" ADD CONSTRAINT "PlotCrop_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotCrop" ADD CONSTRAINT "PlotCrop_cropTypeId_fkey" FOREIGN KEY ("cropTypeId") REFERENCES "CropType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlotCrop" ADD CONSTRAINT "PlotCrop_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "Variety"("id") ON DELETE SET NULL ON UPDATE CASCADE;
