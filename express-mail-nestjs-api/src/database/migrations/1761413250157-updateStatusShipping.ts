import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStatusShipping1761413250157 implements MigrationInterface {
  name = 'UpdateStatusShipping1761413250157';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_post_offices\` CHANGE \`status\` \`status\` enum ('PICKUP_REQUESTED', 'CLASSIFIED', 'IN_WAREHOUSE') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_transitions\` CHANGE \`status\` \`status\` enum ('TRANSITING', 'PENDING', 'DONE') NOT NULL DEFAULT 'PENDING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_transitions\` CHANGE \`status\` \`status\` enum ('TRANSITING', 'PENDING') NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_post_offices\` CHANGE \`status\` \`status\` enum ('CLASSIFIED', 'IN_WAREHOUSE') NOT NULL`,
    );
  }
}
