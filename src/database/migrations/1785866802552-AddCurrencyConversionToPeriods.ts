import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrencyConversionToPeriods1785866802552 implements MigrationInterface {
  name = 'AddCurrencyConversionToPeriods1785866802552';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tipo de cambio USD->MXN capturado manualmente por el admin al cerrar el periodo.
    // Nullable: periodos ya cerrados y periodos 100% MXN no lo requieren.
    await queryRunner.query(
      `ALTER TABLE "collection_periods" ADD COLUMN "exchangeRateUsdToMxn" numeric(10,4)`,
    );

    // Desglose crudo por moneda de lo cobrado por cada colector, previo a convertir a MXN.
    // totalCollected sigue siendo el total ya convertido a MXN (moneda base).
    await queryRunner.query(
      `ALTER TABLE "collector_settlements" ADD COLUMN "collectedByCurrency" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "collector_settlements" DROP COLUMN "collectedByCurrency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_periods" DROP COLUMN "exchangeRateUsdToMxn"`,
    );
  }
}
