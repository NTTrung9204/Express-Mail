import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTableShipping1761045204540 implements MigrationInterface {
  name = 'AddTableShipping1761045204540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_post_offices\` CHANGE \`status\` \`status\` enum ('PICKUP_REQUESTED', 'CLASSIFIED', 'IN_WAREHOUSE') NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`order_transitions\` CHANGE \`status\` \`status\` enum ('TRANSITING', 'PENDING') NOT NULL DEFAULT 'PENDING'`,
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
