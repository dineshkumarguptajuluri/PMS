-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'CLIENT');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING_ONBOARDING', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CheckpointStatus" AS ENUM ('PENDING', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "legalName" TEXT NOT NULL,
    "industryType" TEXT,
    "employeeCount" INTEGER,
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING_ONBOARDING',
    "companyData" JSONB,
    "locationData" JSONB,
    "contactsData" JSONB,
    "legalData" JSONB,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "cinNumber" TEXT,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "clientProfileId" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "docType" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "clientId" INTEGER,
    "managerId" INTEGER,
    "overallTargetDate" TIMESTAMP(3),
    "utilityFocus" TEXT NOT NULL,
    "optimizationDetails" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInterest" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ProjectInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "status" "CheckpointStatus" NOT NULL DEFAULT 'PENDING',
    "order" INTEGER NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_gstNumber_key" ON "ClientProfile"("gstNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_panNumber_key" ON "ClientProfile"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_cinNumber_key" ON "ClientProfile"("cinNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInterest_projectId_clientId_key" ON "ProjectInterest"("projectId", "clientId");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInterest" ADD CONSTRAINT "ProjectInterest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInterest" ADD CONSTRAINT "ProjectInterest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
