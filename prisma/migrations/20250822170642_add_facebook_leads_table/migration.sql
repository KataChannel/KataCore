-- CreateTable
CREATE TABLE "facebook_leads" (
    "id" TEXT NOT NULL,
    "facebookLeadId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "formName" TEXT,
    "pageId" TEXT,
    "pageName" TEXT,
    "userName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "location" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "rawData" JSONB,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "leadSource" TEXT NOT NULL DEFAULT 'FACEBOOK_LEAD_AD',
    "leadStatus" TEXT NOT NULL DEFAULT 'NEW',
    "assignedTo" TEXT,
    "notes" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "createdTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facebook_leads_facebookLeadId_key" ON "facebook_leads"("facebookLeadId");

-- CreateIndex
CREATE INDEX "facebook_leads_email_idx" ON "facebook_leads"("email");

-- CreateIndex
CREATE INDEX "facebook_leads_phone_idx" ON "facebook_leads"("phone");

-- CreateIndex
CREATE INDEX "facebook_leads_leadScore_idx" ON "facebook_leads"("leadScore");

-- CreateIndex
CREATE INDEX "facebook_leads_leadStatus_idx" ON "facebook_leads"("leadStatus");

-- CreateIndex
CREATE INDEX "facebook_leads_createdTime_idx" ON "facebook_leads"("createdTime");

-- AddForeignKey
ALTER TABLE "facebook_leads" ADD CONSTRAINT "facebook_leads_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
