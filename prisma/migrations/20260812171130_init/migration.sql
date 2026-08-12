-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "URLStatus" AS ENUM ('ACTIVE', 'DISABLED', 'EXPIRED', 'DELETED', 'BLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatar" TEXT,
    "googleId" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Short_Url" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "short_url" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "title" TEXT,
    "status" "URLStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiry_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Short_Url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Short_Url_short_url_key" ON "Short_Url"("short_url");

-- CreateIndex
CREATE INDEX "Short_Url_userId_idx" ON "Short_Url"("userId");

-- CreateIndex
CREATE INDEX "Short_Url_short_url_idx" ON "Short_Url"("short_url");

-- AddForeignKey
ALTER TABLE "Short_Url" ADD CONSTRAINT "Short_Url_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
