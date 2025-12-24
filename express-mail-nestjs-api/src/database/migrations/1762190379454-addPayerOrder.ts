import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPayerOrder1762190379454 implements MigrationInterface {
  name = 'AddPayerOrder1762190379454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`is_receiver_pay_shipping\` tinyint NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`is_receiver_pay_shipping\``,
    );
  }
}
