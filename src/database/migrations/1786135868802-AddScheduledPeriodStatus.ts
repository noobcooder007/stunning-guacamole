import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScheduledPeriodStatus1786135868802 implements MigrationInterface {
  name = 'AddScheduledPeriodStatus1786135868802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Permite generar por adelantado los recibos del próximo periodo sin
    // cerrar el actual: el periodo queda SCHEDULED hasta que se abre
    // formalmente, y sus recibos quedan en SCHEDULED hasta entonces.
    await queryRunner.query(
      `ALTER TYPE "public"."collection_periods_status_enum" ADD VALUE 'SCHEDULED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."receipts_status_enum" ADD VALUE 'SCHEDULED'`,
    );

    // Solo puede existir un periodo SCHEDULED a la vez, igual que con OPEN.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_ONE_SCHEDULED_PERIOD" ON "collection_periods" ("status") WHERE status = 'SCHEDULED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_ONE_SCHEDULED_PERIOD"`);

    // Postgres no soporta ALTER TYPE ... DROP VALUE: se recrea el tipo sin
    // 'SCHEDULED'. Falla si quedan filas con ese valor, lo cual es correcto
    // para un rollback (no hay a qué degradar un periodo/recibo programado).
    await queryRunner.query(
      `ALTER TYPE "public"."receipts_status_enum" RENAME TO "receipts_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."receipts_status_enum" AS ENUM('PENDING', 'PAID', 'CANCELLED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "receipts" ALTER COLUMN "status" TYPE "public"."receipts_status_enum" USING "status"::text::"public"."receipts_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."receipts_status_enum_old"`);

    await queryRunner.query(
      `ALTER TYPE "public"."collection_periods_status_enum" RENAME TO "collection_periods_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collection_periods_status_enum" AS ENUM('OPEN', 'CLOSED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_periods" ALTER COLUMN "status" TYPE "public"."collection_periods_status_enum" USING "status"::text::"public"."collection_periods_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."collection_periods_status_enum_old"`,
    );
  }
}
