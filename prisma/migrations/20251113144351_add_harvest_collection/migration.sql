-- CreateTable
CREATE TABLE "HarvestCollection" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "cropTypeId" TEXT NOT NULL,
    "pickerName" TEXT NOT NULL,
    "kilograms" DOUBLE PRECISION NOT NULL,
    "collectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HarvestCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HarvestCollection_plotId_idx" ON "HarvestCollection"("plotId");

-- CreateIndex
CREATE INDEX "HarvestCollection_cropTypeId_idx" ON "HarvestCollection"("cropTypeId");

-- CreateIndex
CREATE INDEX "HarvestCollection_collectionDate_idx" ON "HarvestCollection"("collectionDate");

-- AddForeignKey
ALTER TABLE "HarvestCollection" ADD CONSTRAINT "HarvestCollection_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestCollection" ADD CONSTRAINT "HarvestCollection_cropTypeId_fkey" FOREIGN KEY ("cropTypeId") REFERENCES "CropType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
