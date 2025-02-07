import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsers1738940215518 implements MigrationInterface {
  name = 'AddUsers1738940215518';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP(3) WITH TIME ZONE,
                "first_name" character varying(100) NOT NULL,
                "last_name" character varying(100) NOT NULL,
                "email" character varying(250) NOT NULL,
                "login" character varying(100) NOT NULL,
                "password_hash" bytea NOT NULL,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "users"
        `);
  }
}
