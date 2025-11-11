import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRouteStepIdToShippingTable1762870164088
  implements MigrationInterface
{
  name = 'AddRouteStepIdToShippingTable1762870164088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shipping\` ADD \`route_step_id\` bigint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shipping\` ADD UNIQUE INDEX \`IDX_9b9b2459145144bd50241d60c2\` (\`route_step_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_9b9b2459145144bd50241d60c2\` ON \`shipping\` (\`route_step_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shipping\` ADD CONSTRAINT \`FK_9b9b2459145144bd50241d60c26\` FOREIGN KEY (\`route_step_id\`) REFERENCES \`route_step\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shipping\` DROP FOREIGN KEY \`FK_9b9b2459145144bd50241d60c26\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_9b9b2459145144bd50241d60c2\` ON \`shipping\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shipping\` DROP INDEX \`IDX_9b9b2459145144bd50241d60c2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shipping\` DROP COLUMN \`route_step_id\``,
    );
  }
}
