-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('COMMENT', 'MESSAGE', 'LIKE', 'SHARE');

-- CreateTable
CREATE TABLE "affiliate_referrals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "affiliateCode" TEXT NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_extension_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "callExtensionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_extension_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_extensions" (
    "id" TEXT NOT NULL,
    "extCode" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_extensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_history_overview" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "callerIdNumber" TEXT,
    "outboundCallerIdNumber" TEXT,
    "destinationNumber" TEXT,
    "startEpoch" TEXT,
    "endEpoch" TEXT,
    "answerEpoch" TEXT,
    "duration" TEXT,
    "billsec" TEXT,
    "sipHangupDisposition" TEXT,
    "recordPath" TEXT,
    "callStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cdrId" TEXT NOT NULL,

    CONSTRAINT "call_history_overview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_interactions" (
    "id" TEXT NOT NULL,
    "facebookInteractionId" TEXT NOT NULL,
    "facebookPageId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "userName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facebook_pages" (
    "id" TEXT NOT NULL,
    "facebookPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "fanCount" INTEGER NOT NULL DEFAULT 0,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "link" TEXT,
    "about" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "accessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleVi" TEXT,
    "path" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "permission" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_menu_items" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canAccess" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_affiliateCode_key" ON "affiliates"("affiliateCode");

-- CreateIndex
CREATE UNIQUE INDEX "call_extension_users_userId_callExtensionId_key" ON "call_extension_users"("userId", "callExtensionId");

-- CreateIndex
CREATE UNIQUE INDEX "call_extensions_extCode_key" ON "call_extensions"("extCode");

-- CreateIndex
CREATE UNIQUE INDEX "call_history_overview_cdrId_key" ON "call_history_overview"("cdrId");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_interactions_facebookInteractionId_key" ON "facebook_interactions"("facebookInteractionId");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_pages_facebookPageId_key" ON "facebook_pages"("facebookPageId");

-- CreateIndex
CREATE UNIQUE INDEX "role_menu_items_roleId_menuItemId_key" ON "role_menu_items"("roleId", "menuItemId");

-- AddForeignKey
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_extension_users" ADD CONSTRAINT "call_extension_users_callExtensionId_fkey" FOREIGN KEY ("callExtensionId") REFERENCES "call_extensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_extension_users" ADD CONSTRAINT "call_extension_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facebook_interactions" ADD CONSTRAINT "facebook_interactions_facebookPageId_fkey" FOREIGN KEY ("facebookPageId") REFERENCES "facebook_pages"("facebookPageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu_items" ADD CONSTRAINT "role_menu_items_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu_items" ADD CONSTRAINT "role_menu_items_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
