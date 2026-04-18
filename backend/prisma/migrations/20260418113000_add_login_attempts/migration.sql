-- CreateTable
CREATE TABLE "public"."login_attempts" (
    "email" TEXT NOT NULL,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "window_started_at" TIMESTAMP(3) NOT NULL,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE INDEX "login_attempts_locked_until_idx" ON "public"."login_attempts"("locked_until");
