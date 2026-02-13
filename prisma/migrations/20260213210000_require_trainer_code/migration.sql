-- Backfill any NULL trainer_code values
UPDATE "users" SET "trainer_code" = 'UNKNOWN' WHERE "trainer_code" IS NULL;

-- Make trainer_code required and unique
ALTER TABLE "users" ALTER COLUMN "trainer_code" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_trainer_code_key" UNIQUE ("trainer_code");

-- Add optional second trainer code
ALTER TABLE "users" ADD COLUMN "trainer_code_2" TEXT;
