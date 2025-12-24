import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateShippingStatusFailed1763308396833
  implements MigrationInterface
{
  name = 'UpdateShippingStatusFailed1763308396833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shipping\` CHANGE \`status\` \`status\` enum ('PICKUP_REQUESTED', 'SHIPPING', 'RETURNING', 'FINISHED', 'FAILED', 'PICKUP_FAILED', 'DELIVERY_FAILED') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shipping\` CHANGE \`status\` \`status\` enum ('PICKUP_REQUESTED', 'SHIPPING', 'RETURNING', 'FINISHED', 'FAILED') NOT NULL`,
    );
  }
}
