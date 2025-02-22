import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactions1740233967453 implements MigrationInterface {
  name = 'AddTransactions1740233967453';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."transactions_type_enum" AS ENUM('BUY', 'SELL')
        `);
    await queryRunner.query(`
            CREATE TABLE "transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP(3) WITH TIME ZONE,
                "ticket" character varying(10) NOT NULL,
                "asset_name" character varying(100) NOT NULL,
                "portfolio_id" uuid NOT NULL,
                "price" numeric(18, 4) NOT NULL,
                "quantity" integer NOT NULL,
                "date" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
                "type" "public"."transactions_type_enum" NOT NULL,
                "note" text,
                CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_10ecbf27ef597ed0dd0b2794bc" ON "transactions" ("portfolio_id", "date")
        `);
    await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD CONSTRAINT "FK_6a323de73ef7d943df41a4fdd20" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "transactions" DROP CONSTRAINT "FK_6a323de73ef7d943df41a4fdd20"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_10ecbf27ef597ed0dd0b2794bc"
        `);
    await queryRunner.query(`
            DROP TABLE "transactions"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."transactions_type_enum"
        `);
  }
}
