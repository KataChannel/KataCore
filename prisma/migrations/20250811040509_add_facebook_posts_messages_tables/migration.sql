/*
  Warnings:

  - You are about to drop the `affiliate_referrals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `affiliates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leave_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payrolls` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `performance_reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `positions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "affiliate_referrals" DROP CONSTRAINT "affiliate_referrals_affiliateId_fkey";

-- DropForeignKey
ALTER TABLE "affiliate_referrals" DROP CONSTRAINT "affiliate_referrals_userId_fkey";

-- DropForeignKey
ALTER TABLE "affiliates" DROP CONSTRAINT "affiliates_userId_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_userId_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_managerId_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_parentId_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_positionId_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_userId_fkey";

-- DropForeignKey
ALTER TABLE "leave_requests" DROP CONSTRAINT "leave_requests_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "leave_requests" DROP CONSTRAINT "leave_requests_userId_fkey";

-- DropForeignKey
ALTER TABLE "payrolls" DROP CONSTRAINT "payrolls_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "payrolls" DROP CONSTRAINT "payrolls_userId_fkey";

-- DropForeignKey
ALTER TABLE "performance_reviews" DROP CONSTRAINT "performance_reviews_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "performance_reviews" DROP CONSTRAINT "performance_reviews_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "performance_reviews" DROP CONSTRAINT "performance_reviews_userId_fkey";

-- DropForeignKey
ALTER TABLE "positions" DROP CONSTRAINT "positions_departmentId_fkey";

-- AlterTable
ALTER TABLE "call_extension_users" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "affiliate_referrals";

-- DropTable
DROP TABLE "affiliates";

-- DropTable
DROP TABLE "attendances";

-- DropTable
DROP TABLE "departments";

-- DropTable
DROP TABLE "employees";

-- DropTable
DROP TABLE "leave_requests";

-- DropTable
DROP TABLE "payrolls";

-- DropTable
DROP TABLE "performance_reviews";

-- DropTable
DROP TABLE "positions";

-- DropEnum
DROP TYPE "AttendanceStatus";

-- DropEnum
DROP TYPE "ContractType";

-- DropEnum
DROP TYPE "EmployeeStatus";

-- DropEnum
DROP TYPE "LeaveStatus";

-- DropEnum
DROP TYPE "LeaveType";

-- CreateTable
CREATE TABLE "facebook_posts" (
    "id" TEXT NOT NULL,
    "facebookPostId" TEXT NOT NULL,
    "facebookPageId" TEXT NOT NULL,
    "message" TEXT,
    "story" TEXT,
    "createdTime" TIMESTAMP(3),
    "updatedTime" TIMESTAMP(3),
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "sharesCount" INTEGER NOT NULL DEFAULT 0,
    "postType" TEXT,
    "attachments" JSONB,
    "permalink" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_comments" (
    "id" TEXT NOT NULL,
    "facebookCommentId" TEXT NOT NULL,
    "facebookPostId" TEXT,
    "parentCommentId" TEXT,
    "fromId" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3),
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "canReply" BOOLEAN NOT NULL DEFAULT true,
    "canHide" BOOLEAN NOT NULL DEFAULT false,
    "canLike" BOOLEAN NOT NULL DEFAULT true,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_messages" (
    "id" TEXT NOT NULL,
    "facebookMessageId" TEXT NOT NULL,
    "facebookPageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "message" TEXT,
    "attachments" JSONB,
    "createdTime" TIMESTAMP(3),
    "tags" JSONB,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "isEcho" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_conversations" (
    "id" TEXT NOT NULL,
    "facebookConversationId" TEXT NOT NULL,
    "facebookPageId" TEXT NOT NULL,
    "participants" JSONB,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "canReply" BOOLEAN NOT NULL DEFAULT true,
    "snippet" TEXT,
    "updatedTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facebook_posts_facebookPostId_key" ON "facebook_posts"("facebookPostId");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_comments_facebookCommentId_key" ON "facebook_comments"("facebookCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_messages_facebookMessageId_key" ON "facebook_messages"("facebookMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_conversations_facebookConversationId_key" ON "facebook_conversations"("facebookConversationId");

-- AddForeignKey
ALTER TABLE "facebook_posts" ADD CONSTRAINT "facebook_posts_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "facebook_pages"("facebookPageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_comments" ADD CONSTRAINT "facebook_comments_facebookPostId_fkey" FOREIGN KEY ("facebookPostId") REFERENCES "facebook_posts"("facebookPostId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_comments" ADD CONSTRAINT "facebook_comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "facebook_comments"("facebookCommentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_messages" ADD CONSTRAINT "facebook_messages_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "facebook_pages"("facebookPageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_messages" ADD CONSTRAINT "facebook_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "facebook_conversations"("facebookConversationId") ON DELETE RESTRICT ON UPDATE CASCADE;
