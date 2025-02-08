import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBirthdateColumnToUsers1738941550398 implements MigrationInterface {
  name = 'AddBirthdateColumnToUsers1738941550398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "birthdate" date NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "birthdate"
        `);
  }
}
