-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "referenceCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "jobs_referenceCode_key" ON "jobs"("referenceCode");
