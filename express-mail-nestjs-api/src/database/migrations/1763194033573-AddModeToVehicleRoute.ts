import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModeToVehicleRoute1763194033573 implements MigrationInterface {
  name = 'AddModeToVehicleRoute1763194033573';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_9b9b2459145144bd50241d60c2\` ON \`shipping\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`vehicle_route\` ADD \`mode\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`vehicle_route\` DROP COLUMN \`mode\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_9b9b2459145144bd50241d60c2\` ON \`shipping\` (\`route_step_id\`)`,
    );
  }
}
