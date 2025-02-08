import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPortfolios1739030096347 implements MigrationInterface {
  name = 'AddPortfolios1739030096347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."portfolios_currency_enum" AS ENUM('RUB')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."portfolios_broker_enum" AS ENUM('VTB')
        `);
    await queryRunner.query(`
            CREATE TABLE "portfolios" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP(3) WITH TIME ZONE,
                "name" character varying(50) NOT NULL,
                "description" text,
                "currency" "public"."portfolios_currency_enum" NOT NULL,
                "broker" "public"."portfolios_broker_enum" NOT NULL,
                "user_id" uuid,
                CONSTRAINT "PK_488aa6e9b219d1d9087126871ae" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_57fba72db5ac40768b40f0ecfa" ON "portfolios" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "portfolios"
            ADD CONSTRAINT "FK_57fba72db5ac40768b40f0ecfa1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "portfolios" DROP CONSTRAINT "FK_57fba72db5ac40768b40f0ecfa1"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_57fba72db5ac40768b40f0ecfa"
        `);
    await queryRunner.query(`
            DROP TABLE "portfolios"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."portfolios_broker_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."portfolios_currency_enum"
        `);
  }
}
