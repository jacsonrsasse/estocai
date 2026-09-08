-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'deleted');

-- CreateEnum
CREATE TYPE "user_identifier_type" AS ENUM ('email', 'username');

-- CreateEnum
CREATE TYPE "UserAuthType" AS ENUM ('password', 'oauth');

-- CreateEnum
CREATE TYPE "UserAuthProvider" AS ENUM ('google');

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100),
    "status" "user_status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_identifiers" (
    "user_identifier_id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "user_identifier_type" NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_identifiers_pkey" PRIMARY KEY ("user_identifier_id")
);

-- CreateTable
CREATE TABLE "user_auth_methods" (
    "user_auth_id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "UserAuthType" NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "provider" "UserAuthProvider",
    "providerSubject" VARCHAR(255),

    CONSTRAINT "user_auth_methods_pkey" PRIMARY KEY ("user_auth_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_identifiers_userId_identifier_key" ON "user_identifiers"("userId", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_methods_provider_providerSubject_key" ON "user_auth_methods"("provider", "providerSubject");

-- AddForeignKey
ALTER TABLE "user_identifiers" ADD CONSTRAINT "user_identifiers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_auth_methods" ADD CONSTRAINT "user_auth_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
