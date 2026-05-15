-- CreateTable
CREATE TABLE "log" (
    "id" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "errorName" TEXT,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "errorCode" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "LogSource" NOT NULL,
    "environment" "Environment" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_level_timestamp_idx" ON "log"("level", "timestamp");

-- CreateIndex
CREATE INDEX "log_source_level_timestamp_idx" ON "log"("source", "level", "timestamp");

-- CreateIndex
CREATE INDEX "log_environment_timestamp_idx" ON "log"("environment", "timestamp");

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
