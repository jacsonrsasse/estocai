-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'deleted');

-- CreateEnum
CREATE TYPE "user_identifier_type" AS ENUM ('email', 'username');

-- CreateEnum
CREATE TYPE "user_oauth_provider" AS ENUM ('google');

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "status" "user_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_identifiers" (
    "user_identifier_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "user_identifier_type" NOT NULL,
    "identifier" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_identifiers_pkey" PRIMARY KEY ("user_identifier_id")
);

-- CreateTable
CREATE TABLE "password_credentials" (
    "password_credential_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "password_credentials_pkey" PRIMARY KEY ("password_credential_id")
);

-- CreateTable
CREATE TABLE "oauth_credentials" (
    "oauth_credential_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "user_oauth_provider" NOT NULL,
    "provider_subject" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "oauth_credentials_pkey" PRIMARY KEY ("oauth_credential_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_identifiers_type_identifier_key" ON "user_identifiers"("type", "identifier");

-- AddForeignKey
ALTER TABLE "user_identifiers" ADD CONSTRAINT "user_identifiers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_credentials" ADD CONSTRAINT "password_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_credentials" ADD CONSTRAINT "oauth_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
