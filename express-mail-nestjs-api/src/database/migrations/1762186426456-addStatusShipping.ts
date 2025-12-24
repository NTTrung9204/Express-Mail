import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusShipping1762186426456 implements MigrationInterface {
  name = 'AddStatusShipping1762186426456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shipping\` CHANGE \`status\` \`status\` enum ('PICKUP_REQUESTED', 'SHIPPING', 'RETURNING', 'FINISHED') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shipping\` CHANGE \`status\` \`status\` enum ('PICKUP_REQUESTED', 'SHIPPING', 'RETURNING') NOT NULL`,
    );
  }
}
