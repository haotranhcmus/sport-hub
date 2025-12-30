-- CreateEnum for new return-related enums
CREATE TYPE "ReturnType" AS ENUM ('EXCHANGE', 'REFUND');
CREATE TYPE "ReturnRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'SHIPPING_BACK', 'RECEIVED', 'COMPLETED', 'REJECTED', 'CANCELLED');
CREATE TYPE "ItemReturnStatus" AS ENUM ('NONE', 'HAS_REQUEST', 'EXCHANGED', 'REFUNDED', 'REJECTED');

-- Add returnStatus to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "returnStatus" "ItemReturnStatus" NOT NULL DEFAULT 'NONE';
CREATE INDEX "OrderItem_returnStatus_idx" ON "OrderItem"("returnStatus");

-- Remove old returnInfo JSON column from Order (if exists)
-- ALTER TABLE "Order" DROP COLUMN IF EXISTS "returnInfo";

-- CreateTable ReturnRequest
CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "type" "ReturnType" NOT NULL,
    "status" "ReturnRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "evidenceImages" TEXT[],
    "refundAmount" DOUBLE PRECISION,
    "bankInfo" JSONB,
    "exchangeToSize" TEXT,
    "exchangeToColor" TEXT,
    "newOrderId" TEXT,
    "adminNotes" TEXT,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequest_requestCode_key" ON "ReturnRequest"("requestCode");
CREATE INDEX "ReturnRequest_orderId_idx" ON "ReturnRequest"("orderId");
CREATE INDEX "ReturnRequest_orderItemId_idx" ON "ReturnRequest"("orderItemId");
CREATE INDEX "ReturnRequest_status_idx" ON "ReturnRequest"("status");
CREATE INDEX "ReturnRequest_type_idx" ON "ReturnRequest"("type");
CREATE INDEX "ReturnRequest_requestCode_idx" ON "ReturnRequest"("requestCode");
CREATE INDEX "ReturnRequest_createdAt_idx" ON "ReturnRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
