-- CreateEnum
CREATE TYPE "public"."FamilyInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."family_invitations" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "inviter_user_id" UUID NOT NULL,
    "invitee_name" TEXT NOT NULL,
    "invitee_email" TEXT NOT NULL,
    "status" "public"."FamilyInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "family_invitations_family_id_invitee_email_key" ON "public"."family_invitations"("family_id", "invitee_email");

-- CreateIndex
CREATE INDEX "family_invitations_family_id_status_idx" ON "public"."family_invitations"("family_id", "status");

-- CreateIndex
CREATE INDEX "family_invitations_inviter_user_id_idx" ON "public"."family_invitations"("inviter_user_id");

-- AddForeignKey
ALTER TABLE "public"."family_invitations" ADD CONSTRAINT "family_invitations_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."family_invitations" ADD CONSTRAINT "family_invitations_inviter_user_id_fkey" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
