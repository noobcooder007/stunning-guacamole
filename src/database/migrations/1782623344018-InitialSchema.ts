import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1782623344018 implements MigrationInterface {
  name = 'InitialSchema1782623344018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."audit_logs_status_enum" AS ENUM('SUCCESS', 'FAILURE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL, "traceId" text, "userId" uuid, "operation" text NOT NULL, "status" "public"."audit_logs_status_enum" NOT NULL, "errorMessage" text, "durationMs" integer NOT NULL, "ip" text, "userAgent" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8873ff53e998ead3c10a6b213b" ON "audit_logs" ("traceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cfa83f61e4d27a87fcae1e025a" ON "audit_logs" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c69efb19bf127c97e6740ad530" ON "audit_logs" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5811353442cd295cf4c65f1089" ON "audit_logs" ("operation", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99e589da8f9e9326ee0d01a028" ON "audit_logs" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL, "name" text NOT NULL, "description" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL, "name" text NOT NULL, "description" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("sessionId" uuid NOT NULL, "userId" uuid NOT NULL, "hashedRefreshToken" text NOT NULL, "ip" text NOT NULL, "userAgent" text NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE, "revoked" boolean NOT NULL, CONSTRAINT "PK_ba57f8421edf5e5c4e99b833811" PRIMARY KEY ("sessionId"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_gender_enum" AS ENUM('MALE', 'FEMALE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL, "username" text NOT NULL, "password" text NOT NULL, "roleId" uuid NOT NULL, "lastLogin" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "gender" "public"."users_gender_enum", CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "churches" ("id" uuid NOT NULL, "name" text NOT NULL, "vicaria" text NOT NULL, "decanato" text NOT NULL, "parroquia" text NOT NULL, "capilla" text NOT NULL, "street" text NOT NULL, "noExt" text NOT NULL, "noInt" text, "neighborhood" text, "locality" text, "city" text NOT NULL, "state" text NOT NULL, "zipCode" text NOT NULL, "priestFirstname" text NOT NULL, "priestFirstLastname" text NOT NULL, "priestSecondLastname" text, "auxiliarPriestFirstname" text NOT NULL, "auxiliarPriestFirstLastname" text NOT NULL, "auxiliarPriestSecondLastname" text, "phoneNumber" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_abe867584e6a0f517c576c94823" UNIQUE ("street", "noExt", "city", "state", "zipCode"), CONSTRAINT "UQ_206de78cc8c19e774b59f501d1f" UNIQUE ("vicaria", "decanato", "parroquia", "capilla"), CONSTRAINT "PK_6048a6f37c897751d61cbb0347a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_608a2da42f218ef5bd517a8f5d" ON "churches" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a39b61d1f63c74bf8eaf713f7" ON "churches" ("name") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."promise_donations_currency_enum" AS ENUM('USD', 'MXN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "promise_donations" ("id" uuid NOT NULL, "beneficientId" uuid NOT NULL, "promiseAmount" numeric(12,2) NOT NULL, "currency" "public"."promise_donations_currency_enum" NOT NULL, "method" text NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "recurring" boolean NOT NULL, "recurrence" integer NOT NULL, "lastDonation" TIMESTAMP WITH TIME ZONE, "nextDonation" TIMESTAMP WITH TIME ZONE, "isActive" boolean NOT NULL DEFAULT true, "reasonDeactivated" text, "createdBy" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(), "instructions" json, CONSTRAINT "UQ_95f344c4948abff6525876feb02" UNIQUE ("beneficientId"), CONSTRAINT "REL_95f344c4948abff6525876feb0" UNIQUE ("beneficientId"), CONSTRAINT "CHK_bb4af0357cadef6569d41f27d9" CHECK ("isActive" = true OR ("isActive" = false AND "reasonDeactivated" IS NOT NULL AND "reasonDeactivated" <> '')), CONSTRAINT "PK_d6d7ac8b92ac4f41cf3704ba493" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_95f344c4948abff6525876feb0" ON "promise_donations" ("beneficientId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1c7f5e08fe11a64cf55ab72a6e" ON "promise_donations" ("currency") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4140f1c7dd68a913bbfd9fb909" ON "promise_donations" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0f22480e166f73498d1e9ae74d" ON "promise_donations" ("isActive", "nextDonation") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."beneficients_title_enum" AS ENUM('Sr', 'Sra', 'Srta', 'Srto')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."beneficients_genre_enum" AS ENUM('M', 'F')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."beneficients_maritalstatus_enum" AS ENUM('Soltero', 'Casado', 'Divorciado', 'Viudo')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."beneficients_person_enum" AS ENUM('FISICA', 'MORAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "beneficients" ("id" uuid NOT NULL, "title" "public"."beneficients_title_enum", "firstname" text NOT NULL, "firstLastname" text NOT NULL, "secondLastname" text, "birthday" TIMESTAMP WITH TIME ZONE NOT NULL, "weddingAnniversary" TIMESTAMP WITH TIME ZONE, "genre" "public"."beneficients_genre_enum" NOT NULL, "maritalStatus" "public"."beneficients_maritalstatus_enum" NOT NULL, "churchId" uuid NOT NULL, "street" text NOT NULL, "noExt" text NOT NULL, "noInt" text, "neighborhood" text, "locality" text, "city" text NOT NULL, "state" text NOT NULL, "zipCode" text NOT NULL, "addressHash" text NOT NULL, "email" text, "emailHash" text, "phoneNumber" text, "phoneNumberHash" text, "person" "public"."beneficients_person_enum", "registeredName" text, "rfc" text, "rfcHash" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "reasonDeactivated" text, "deactivatedAt" TIMESTAMP WITH TIME ZONE, "beneficientNumber" SERIAL NOT NULL, "keepPrivate" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_0d4e21869f8096e6b0a06242463" UNIQUE ("addressHash"), CONSTRAINT "UQ_4212fc08593a1e150a9fd6e54d0" UNIQUE ("email"), CONSTRAINT "UQ_bceae707dda951e4e03c272d688" UNIQUE ("phoneNumber"), CONSTRAINT "UQ_7ee89ea3dd31ff9774586b4793b" UNIQUE ("rfc"), CONSTRAINT "UQ_37a9da7005baf615f747a8add0f" UNIQUE ("beneficientNumber"), CONSTRAINT "UQ_c27ced586f35671dc8e5abd2138" UNIQUE ("firstname", "firstLastname", "secondLastname"), CONSTRAINT "PK_a475817e46bcff39374f802ed2e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f7a9581bff746dd0ba12586593" ON "beneficients" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e48092ca7fe3eeeca103fa45ae" ON "beneficients" ("state", "city") `,
    );
    await queryRunner.query(
      `CREATE TABLE "assignations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "collectorId" uuid NOT NULL, "beneficientId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "isActive" boolean NOT NULL DEFAULT true, "reasonDeactivated" text, CONSTRAINT "CHK_751253946eb1bd9e4a5fed0df6" CHECK ("isActive" = true OR ("isActive" = false AND "reasonDeactivated" IS NOT NULL AND "reasonDeactivated" <> '')), CONSTRAINT "PK_bd43902627f5fae57eda8b00033" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_UQ_ACTIVE_PROMISE_DONATION" ON "assignations" ("beneficientId") WHERE "isActive" = true`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_076c1d56bc8d224efa635cd616" ON "assignations" ("collectorId", "beneficientId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "collectors" ("id" uuid NOT NULL, "userId" uuid NOT NULL, "firstname" text NOT NULL, "firstLastname" text NOT NULL, "secondLastname" text, "nss" text NOT NULL, "nssHash" text NOT NULL, "street" text NOT NULL, "noExt" text NOT NULL, "noInt" text, "neighborhood" text, "locality" text, "city" text NOT NULL, "state" text NOT NULL, "zipCode" text NOT NULL, "addressHash" text NOT NULL, "phoneNumber" text NOT NULL, "phoneNumberHash" text NOT NULL, "telephoneNumber" text, "telephoneNumberHash" text, "commissionPercent" integer NOT NULL, "nomina" numeric(14,2) NOT NULL DEFAULT '0', "transportAllowance" numeric(14,2) NOT NULL DEFAULT '0', "bank" text, "reference" text, "notes" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "profilePath" text, "collectorNumber" SERIAL NOT NULL, CONSTRAINT "UQ_c4d16a03be5e110ad31ca8dd498" UNIQUE ("nss"), CONSTRAINT "UQ_e42e83c960fc6c86912ba4eb2c3" UNIQUE ("nssHash"), CONSTRAINT "UQ_f4e72c7c99153f0537cd2e0b33f" UNIQUE ("addressHash"), CONSTRAINT "UQ_98975f033e2735ce7d45dd0d4db" UNIQUE ("phoneNumber"), CONSTRAINT "UQ_f8bbf7092ef7f7166e06f6666ab" UNIQUE ("phoneNumberHash"), CONSTRAINT "UQ_642120613b336a4673e5d35b44e" UNIQUE ("telephoneNumber"), CONSTRAINT "UQ_3c5f15d1e08312466d2c87de2e5" UNIQUE ("collectorNumber"), CONSTRAINT "UQ_fa65228b60612aa6c7125b8092a" UNIQUE ("firstname", "firstLastname", "secondLastname"), CONSTRAINT "UQ_3c5f15d1e08312466d2c87de2e5" UNIQUE ("collectorNumber"), CONSTRAINT "REL_c34a51e6d3cc0caad2667c4cc5" UNIQUE ("userId"), CONSTRAINT "PK_da4185226ea730100d5aa647afe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dfa8825e4e1caf7bda02e82564" ON "collectors" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_37f7af2c98f753e5c064983ef2" ON "collectors" ("state", "city") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."receipts_status_enum" AS ENUM('PENDING', 'PAID', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."receipts_type_enum" AS ENUM('RECURRING', 'SPECIAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."receipts_origin_enum" AS ENUM('PROMISE', 'NON_PROMISE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "receipts" ("id" uuid NOT NULL, "status" "public"."receipts_status_enum" NOT NULL, "folio" text NOT NULL, "type" "public"."receipts_type_enum" NOT NULL, "origin" "public"."receipts_origin_enum" NOT NULL, "amount" numeric(12,2) NOT NULL, "currency" text NOT NULL, "paymentMethod" text, "externalReference" text, "promiseDonationId" uuid, "periodMonth" integer, "periodYear" integer, "beneficientId" uuid, "collectorId" uuid, "printCount" integer NOT NULL, "lastPrintedAt" TIMESTAMP WITH TIME ZONE, "voidReason" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "createdBy" uuid NOT NULL, "updatedBy" uuid NOT NULL, "chainValidator" text, "collectionPeriodId" uuid, "paidAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_283d40d8367dd8bba72e50b2ef4" UNIQUE ("promiseDonationId", "periodMonth", "periodYear"), CONSTRAINT "UQ_aff883786d6ae433f6a088d6a0b" UNIQUE ("folio"), CONSTRAINT "PK_5e8182d7c29e023da6e1ff33bfe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a2f3740117444fdad6ebc452e" ON "receipts" ("promiseDonationId", "beneficientId", "collectorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0b31225bf4f87eb2e67d60a0a" ON "receipts" ("folio", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "collector_settlements" ("id" uuid NOT NULL, "collectionPeriodId" uuid NOT NULL, "collectorId" uuid NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "totalCollected" numeric(14,2) NOT NULL, "commissionPercent" integer NOT NULL, "commissionAmount" numeric(14,2) NOT NULL, "nomina" numeric(14,2) NOT NULL DEFAULT '0', "transportAllowance" numeric(14,2) NOT NULL DEFAULT '0', "netCommission" numeric(14,2) NOT NULL DEFAULT '0', "paymentStatus" character varying NOT NULL DEFAULT 'PENDING', "totalPaid" numeric(14,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "UQ_aad8aa3851879c391c6732a9303" UNIQUE ("collectionPeriodId", "collectorId"), CONSTRAINT "PK_3c57328fe82ae1604070e6704dc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb7b18a20df0dcf25a5411f31f" ON "collector_settlements" ("collectionPeriodId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "receipt_sequences" ("collectorId" uuid NOT NULL, "type" character varying NOT NULL, "year" integer NOT NULL, "lastValue" integer NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2ed5b4687fa224fd30300ba6a38" UNIQUE ("collectorId", "type", "year"), CONSTRAINT "CHK_ddcba3eae20774d39f4f7e7d8b" CHECK ("lastValue" >= 0), CONSTRAINT "PK_2ed5b4687fa224fd30300ba6a38" PRIMARY KEY ("collectorId", "type", "year"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collection_periods_status_enum" AS ENUM('OPEN', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "collection_periods" ("id" uuid NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "status" "public"."collection_periods_status_enum" NOT NULL, "closedAt" TIMESTAMP WITH TIME ZONE, "closedBy" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "createdBy" uuid NOT NULL, "totalCollected" numeric(14,2), "totalCommissions" numeric(14,2), "totalNet" numeric(14,2), CONSTRAINT "PK_1520be7b88c58841ef048edc3f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_ONE_OPEN_PERIOD" ON "collection_periods" ("status") WHERE status = 'OPEN'`,
    );
    await queryRunner.query(
      `CREATE TABLE "collector_payments" ("id" uuid NOT NULL, "settlementId" uuid NOT NULL, "collectorId" uuid NOT NULL, "amount" numeric(14,2) NOT NULL, "paymentMethod" character varying NOT NULL, "reference" text, "notes" text, "paidAt" TIMESTAMP WITH TIME ZONE NOT NULL, "registeredBy" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_ca325cd49186b9c2a9fe5ae56fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0745243b34e2fbd82841c00936" ON "collector_payments" ("collectorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b91669ed45e619fb91c37af8ff" ON "collector_payments" ("settlementId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("rolesId" uuid NOT NULL, "permissionsId" uuid NOT NULL, CONSTRAINT "PK_7931614007a93423204b4b73240" PRIMARY KEY ("rolesId", "permissionsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0cb93c5877d37e954e2aa59e52" ON "role_permissions" ("rolesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d422dabc78ff74a8dab6583da0" ON "role_permissions" ("permissionsId") `,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5811353442cd295cf4c65f1089"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99e589da8f9e9326ee0d01a028"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5811353442cd295cf4c65f1089" ON "audit_logs" ("operation", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99e589da8f9e9326ee0d01a028" ON "audit_logs" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "promise_donations" ADD CONSTRAINT "FK_95f344c4948abff6525876feb02" FOREIGN KEY ("beneficientId") REFERENCES "beneficients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ADD CONSTRAINT "FK_7784822487d42a594853dd9c279" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignations" ADD CONSTRAINT "FK_aff8bfde46e1682f3fdb83a3b17" FOREIGN KEY ("collectorId") REFERENCES "collectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignations" ADD CONSTRAINT "FK_06d1c5ebd87cdda9552ae57e57a" FOREIGN KEY ("beneficientId") REFERENCES "beneficients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ADD CONSTRAINT "FK_c34a51e6d3cc0caad2667c4cc52" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "receipts" ADD CONSTRAINT "FK_06359353f2744b5e9687e15b89f" FOREIGN KEY ("promiseDonationId") REFERENCES "promise_donations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "receipts" ADD CONSTRAINT "FK_da6460cd8aa8c09f9b6cce6801b" FOREIGN KEY ("beneficientId") REFERENCES "beneficients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "receipts" ADD CONSTRAINT "FK_bb491f4ebfa8ab5845894e8ac33" FOREIGN KEY ("collectorId") REFERENCES "collectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_d422dabc78ff74a8dab6583da02" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_d422dabc78ff74a8dab6583da02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "receipts" DROP CONSTRAINT "FK_bb491f4ebfa8ab5845894e8ac33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "receipts" DROP CONSTRAINT "FK_da6460cd8aa8c09f9b6cce6801b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "receipts" DROP CONSTRAINT "FK_06359353f2744b5e9687e15b89f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" DROP CONSTRAINT "FK_c34a51e6d3cc0caad2667c4cc52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignations" DROP CONSTRAINT "FK_06d1c5ebd87cdda9552ae57e57a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignations" DROP CONSTRAINT "FK_aff8bfde46e1682f3fdb83a3b17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" DROP CONSTRAINT "FK_7784822487d42a594853dd9c279"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promise_donations" DROP CONSTRAINT "FK_95f344c4948abff6525876feb02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99e589da8f9e9326ee0d01a028"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5811353442cd295cf4c65f1089"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99e589da8f9e9326ee0d01a028" ON "audit_logs" ("userId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5811353442cd295cf4c65f1089" ON "audit_logs" ("operation", "createdAt") `,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d422dabc78ff74a8dab6583da0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0cb93c5877d37e954e2aa59e52"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b91669ed45e619fb91c37af8ff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0745243b34e2fbd82841c00936"`,
    );
    await queryRunner.query(`DROP TABLE "collector_payments"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_ONE_OPEN_PERIOD"`);
    await queryRunner.query(`DROP TABLE "collection_periods"`);
    await queryRunner.query(
      `DROP TYPE "public"."collection_periods_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "receipt_sequences"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb7b18a20df0dcf25a5411f31f"`,
    );
    await queryRunner.query(`DROP TABLE "collector_settlements"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b0b31225bf4f87eb2e67d60a0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a2f3740117444fdad6ebc452e"`,
    );
    await queryRunner.query(`DROP TABLE "receipts"`);
    await queryRunner.query(`DROP TYPE "public"."receipts_origin_enum"`);
    await queryRunner.query(`DROP TYPE "public"."receipts_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."receipts_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_37f7af2c98f753e5c064983ef2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dfa8825e4e1caf7bda02e82564"`,
    );
    await queryRunner.query(`DROP TABLE "collectors"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_076c1d56bc8d224efa635cd616"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_UQ_ACTIVE_PROMISE_DONATION"`,
    );
    await queryRunner.query(`DROP TABLE "assignations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e48092ca7fe3eeeca103fa45ae"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f7a9581bff746dd0ba12586593"`,
    );
    await queryRunner.query(`DROP TABLE "beneficients"`);
    await queryRunner.query(`DROP TYPE "public"."beneficients_person_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."beneficients_maritalstatus_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."beneficients_genre_enum"`);
    await queryRunner.query(`DROP TYPE "public"."beneficients_title_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0f22480e166f73498d1e9ae74d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4140f1c7dd68a913bbfd9fb909"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1c7f5e08fe11a64cf55ab72a6e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_95f344c4948abff6525876feb0"`,
    );
    await queryRunner.query(`DROP TABLE "promise_donations"`);
    await queryRunner.query(
      `DROP TYPE "public"."promise_donations_currency_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2a39b61d1f63c74bf8eaf713f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_608a2da42f218ef5bd517a8f5d"`,
    );
    await queryRunner.query(`DROP TABLE "churches"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99e589da8f9e9326ee0d01a028"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5811353442cd295cf4c65f1089"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c69efb19bf127c97e6740ad530"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cfa83f61e4d27a87fcae1e025a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8873ff53e998ead3c10a6b213b"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_status_enum"`);
  }
}
