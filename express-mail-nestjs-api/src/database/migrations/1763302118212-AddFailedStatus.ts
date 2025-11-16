import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFailedStatus1763302118212 implements MigrationInterface {
  name = 'AddFailedStatus1763302118212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shipping\` CHANGE \`status\` \`status\` enum ('PICKUP_REQUESTED', 'SHIPPING', 'RETURNING', 'FINISHED', 'FAILED') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shipping\` CHANGE \`status\` \`status\` enum ('PICKUP_REQUESTED', 'SHIPPING', 'RETURNING', 'FINISHED') NOT NULL`,
    );
  }
}
