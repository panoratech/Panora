/*
  Warnings:

  - You are about to drop the `Crm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Crm";

-- CreateTable
CREATE TABLE "applications" (
    "id" BIGINT NOT NULL,
    "uuid_project" TEXT NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" BIGINT NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_contact_email_addresses" (
    "id_crm_contact_email" BIGINT NOT NULL,
    "uuid_crm_contact_email" TEXT NOT NULL,
    "uuid_crm_contact" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "email_address_type" TEXT NOT NULL,

    CONSTRAINT "crm_contact_email_addresses_pkey" PRIMARY KEY ("id_crm_contact_email")
);

-- CreateTable
CREATE TABLE "crm_contacts" (
    "id_crm_contact" BIGINT NOT NULL,
    "uuid_crm_contact" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,

    CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("id_crm_contact")
);

-- CreateTable
CREATE TABLE "crm_contacts_phone_numbers" (
    "id_crm_contacts_phone_number" BIGINT NOT NULL,
    "uuid_crm_contacts_phone_number" TEXT NOT NULL,
    "uuid_crm_contact" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phone_type" TEXT NOT NULL,

    CONSTRAINT "crm_contacts_phone_numbers_pkey" PRIMARY KEY ("id_crm_contacts_phone_number")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id_organization" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id_organization")
);

-- CreateTable
CREATE TABLE "projects" (
    "id_project" BIGINT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id_project")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" BIGINT NOT NULL,
    "uuid_user" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "uuid_organization" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "crm_contact_email_addresses_uuid_crm_contact_email_unique" ON "crm_contact_email_addresses"("uuid_crm_contact_email");

-- CreateIndex
CREATE UNIQUE INDEX "crm_contacts_uuid_crm_contact_unique" ON "crm_contacts"("uuid_crm_contact");

-- CreateIndex
CREATE UNIQUE INDEX "crm_contacts_phone_numbers_uuid_crm_contacts_phone_number_uniqu" ON "crm_contacts_phone_numbers"("uuid_crm_contacts_phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_user_unique" ON "users"("uuid_user");
