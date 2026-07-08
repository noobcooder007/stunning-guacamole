import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfilesTable1783476893213 implements MigrationInterface {
  name = 'AddProfilesTable1783476893213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tabla profiles: núcleo de identidad compartido entre collectors y beneficients.
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" uuid NOT NULL, "firstname" text NOT NULL, "firstLastname" text NOT NULL, "secondLastname" text, "street" text NOT NULL, "noExt" text NOT NULL, "noInt" text, "neighborhood" text, "locality" text, "city" text NOT NULL, "state" text NOT NULL, "zipCode" text NOT NULL, "addressHash" text NOT NULL, "phoneNumber" text, "phoneNumberHash" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_profiles_addressHash" UNIQUE ("addressHash"), CONSTRAINT "UQ_profiles_phoneNumber" UNIQUE ("phoneNumber"), CONSTRAINT "UQ_profiles_phoneNumberHash" UNIQUE ("phoneNumberHash"), CONSTRAINT "UQ_profiles_name" UNIQUE ("firstname", "firstLastname", "secondLastname"), CONSTRAINT "PK_profiles" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_profiles_createdAt" ON "profiles" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_profiles_state_city" ON "profiles" ("state", "city") `,
    );

    // 2. Columna profileId nullable temporalmente, para poder backfillear antes de exigir NOT NULL.
    await queryRunner.query(
      `ALTER TABLE "collectors" ADD COLUMN "profileId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ADD COLUMN "profileId" uuid`,
    );

    // 3. Backfill: un profile por cada collector existente (dirección y teléfono siempre presentes en collectors).
    await queryRunner.query(`
      DO $$
      DECLARE
        rec RECORD;
        new_id uuid;
      BEGIN
        FOR rec IN SELECT * FROM collectors LOOP
          new_id := uuid_generate_v4();
          INSERT INTO profiles (
            id, firstname, "firstLastname", "secondLastname",
            street, "noExt", "noInt", neighborhood, locality, city, state, "zipCode", "addressHash",
            "phoneNumber", "phoneNumberHash", "createdAt"
          ) VALUES (
            new_id, rec.firstname, rec."firstLastname", rec."secondLastname",
            rec.street, rec."noExt", rec."noInt", rec.neighborhood, rec.locality, rec.city, rec.state, rec."zipCode", rec."addressHash",
            rec."phoneNumber", rec."phoneNumberHash", rec."createdAt"
          );
          UPDATE collectors SET "profileId" = new_id WHERE id = rec.id;
        END LOOP;
      END $$;
    `);

    // 4. Backfill: un profile por cada beneficient existente. phoneNumber es opcional en beneficients;
    //    se normaliza cadena vacía a NULL para no violar el UNIQUE de profiles.phoneNumber/phoneNumberHash.
    await queryRunner.query(`
      DO $$
      DECLARE
        rec RECORD;
        new_id uuid;
        v_phone text;
        v_phone_hash text;
      BEGIN
        FOR rec IN SELECT * FROM beneficients LOOP
          new_id := uuid_generate_v4();
          v_phone := NULLIF(rec."phoneNumber", '');
          v_phone_hash := CASE WHEN v_phone IS NULL THEN NULL ELSE NULLIF(rec."phoneNumberHash", '') END;
          INSERT INTO profiles (
            id, firstname, "firstLastname", "secondLastname",
            street, "noExt", "noInt", neighborhood, locality, city, state, "zipCode", "addressHash",
            "phoneNumber", "phoneNumberHash", "createdAt"
          ) VALUES (
            new_id, rec.firstname, rec."firstLastname", rec."secondLastname",
            rec.street, rec."noExt", rec."noInt", rec.neighborhood, rec.locality, rec.city, rec.state, rec."zipCode", rec."addressHash",
            v_phone, v_phone_hash, rec."createdAt"
          );
          UPDATE beneficients SET "profileId" = new_id WHERE id = rec.id;
        END LOOP;
      END $$;
    `);

    // 5. Quitar columnas de identidad ahora migradas a profiles.
    //    DROP COLUMN arrastra automáticamente sus constraints/índices propios (incluidos los compuestos).
    await queryRunner.query(`
      ALTER TABLE "collectors"
        DROP COLUMN "firstname",
        DROP COLUMN "firstLastname",
        DROP COLUMN "secondLastname",
        DROP COLUMN "street",
        DROP COLUMN "noExt",
        DROP COLUMN "noInt",
        DROP COLUMN "neighborhood",
        DROP COLUMN "locality",
        DROP COLUMN "city",
        DROP COLUMN "state",
        DROP COLUMN "zipCode",
        DROP COLUMN "addressHash",
        DROP COLUMN "phoneNumber",
        DROP COLUMN "phoneNumberHash"
    `);
    await queryRunner.query(`
      ALTER TABLE "beneficients"
        DROP COLUMN "firstname",
        DROP COLUMN "firstLastname",
        DROP COLUMN "secondLastname",
        DROP COLUMN "street",
        DROP COLUMN "noExt",
        DROP COLUMN "noInt",
        DROP COLUMN "neighborhood",
        DROP COLUMN "locality",
        DROP COLUMN "city",
        DROP COLUMN "state",
        DROP COLUMN "zipCode",
        DROP COLUMN "addressHash",
        DROP COLUMN "phoneNumber",
        DROP COLUMN "phoneNumberHash"
    `);

    // 6. profileId pasa a ser obligatorio, único y con FK hacia profiles.
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "profileId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ADD CONSTRAINT "UQ_collectors_profileId" UNIQUE ("profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ADD CONSTRAINT "FK_collectors_profileId" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "beneficients" ALTER COLUMN "profileId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ADD CONSTRAINT "UQ_beneficients_profileId" UNIQUE ("profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ADD CONSTRAINT "FK_beneficients_profileId" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert best-effort: reconstruye columnas en collectors/beneficients desde profiles y elimina profiles.
    await queryRunner.query(
      `ALTER TABLE "beneficients" DROP CONSTRAINT "FK_beneficients_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" DROP CONSTRAINT "UQ_beneficients_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" DROP CONSTRAINT "FK_collectors_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" DROP CONSTRAINT "UQ_collectors_profileId"`,
    );

    await queryRunner.query(`
      ALTER TABLE "collectors"
        ADD COLUMN "firstname" text,
        ADD COLUMN "firstLastname" text,
        ADD COLUMN "secondLastname" text,
        ADD COLUMN "street" text,
        ADD COLUMN "noExt" text,
        ADD COLUMN "noInt" text,
        ADD COLUMN "neighborhood" text,
        ADD COLUMN "locality" text,
        ADD COLUMN "city" text,
        ADD COLUMN "state" text,
        ADD COLUMN "zipCode" text,
        ADD COLUMN "addressHash" text,
        ADD COLUMN "phoneNumber" text,
        ADD COLUMN "phoneNumberHash" text
    `);
    await queryRunner.query(`
      ALTER TABLE "beneficients"
        ADD COLUMN "firstname" text,
        ADD COLUMN "firstLastname" text,
        ADD COLUMN "secondLastname" text,
        ADD COLUMN "street" text,
        ADD COLUMN "noExt" text,
        ADD COLUMN "noInt" text,
        ADD COLUMN "neighborhood" text,
        ADD COLUMN "locality" text,
        ADD COLUMN "city" text,
        ADD COLUMN "state" text,
        ADD COLUMN "zipCode" text,
        ADD COLUMN "addressHash" text,
        ADD COLUMN "phoneNumber" text,
        ADD COLUMN "phoneNumberHash" text
    `);

    await queryRunner.query(`
      UPDATE collectors c SET
        firstname = p.firstname,
        "firstLastname" = p."firstLastname",
        "secondLastname" = p."secondLastname",
        street = p.street,
        "noExt" = p."noExt",
        "noInt" = p."noInt",
        neighborhood = p.neighborhood,
        locality = p.locality,
        city = p.city,
        state = p.state,
        "zipCode" = p."zipCode",
        "addressHash" = p."addressHash",
        "phoneNumber" = p."phoneNumber",
        "phoneNumberHash" = p."phoneNumberHash"
      FROM profiles p
      WHERE p.id = c."profileId"
    `);
    await queryRunner.query(`
      UPDATE beneficients b SET
        firstname = p.firstname,
        "firstLastname" = p."firstLastname",
        "secondLastname" = p."secondLastname",
        street = p.street,
        "noExt" = p."noExt",
        "noInt" = p."noInt",
        neighborhood = p.neighborhood,
        locality = p.locality,
        city = p.city,
        state = p.state,
        "zipCode" = p."zipCode",
        "addressHash" = p."addressHash",
        "phoneNumber" = p."phoneNumber",
        "phoneNumberHash" = p."phoneNumberHash"
      FROM profiles p
      WHERE p.id = b."profileId"
    `);

    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "firstname" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "firstLastname" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "street" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "noExt" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "city" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "state" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "zipCode" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "addressHash" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "phoneNumber" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ALTER COLUMN "phoneNumberHash" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ADD CONSTRAINT "UQ_collectors_name" UNIQUE ("firstname", "firstLastname", "secondLastname")`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ADD CONSTRAINT "UQ_collectors_addressHash" UNIQUE ("addressHash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ADD CONSTRAINT "UQ_collectors_phoneNumber" UNIQUE ("phoneNumber")`,
    );
    await queryRunner.query(
      `ALTER TABLE "collectors" ADD CONSTRAINT "UQ_collectors_phoneNumberHash" UNIQUE ("phoneNumberHash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_collectors_state_city" ON "collectors" ("state", "city")`,
    );

    await queryRunner.query(
      `ALTER TABLE "beneficients" ALTER COLUMN "firstname" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ALTER COLUMN "firstLastname" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ALTER COLUMN "street" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ALTER COLUMN "noExt" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ALTER COLUMN "city" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ALTER COLUMN "state" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ALTER COLUMN "zipCode" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ALTER COLUMN "addressHash" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ADD CONSTRAINT "UQ_beneficients_name" UNIQUE ("firstname", "firstLastname", "secondLastname")`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ADD CONSTRAINT "UQ_beneficients_addressHash" UNIQUE ("addressHash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" ADD CONSTRAINT "UQ_beneficients_phoneNumber" UNIQUE ("phoneNumber")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_beneficients_state_city" ON "beneficients" ("state", "city")`,
    );

    await queryRunner.query(
      `ALTER TABLE "collectors" DROP COLUMN "profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "beneficients" DROP COLUMN "profileId"`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_profiles_state_city"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_profiles_createdAt"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
  }
}
