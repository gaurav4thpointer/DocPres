-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('DEMO', 'STARTER', 'GROWTH', 'SCALE');

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'DEMO';
