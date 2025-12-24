import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowVehicleIdIsNull1762857592312 implements MigrationInterface {
  name = 'AllowVehicleIdIsNull1762857592312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`vehicle_route\` CHANGE \`vehicle_id\` \`vehicle_id\` varchar(50) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`vehicle_route\` CHANGE \`vehicle_id\` \`vehicle_id\` varchar(50) NOT NULL`,
    );
  }
}
