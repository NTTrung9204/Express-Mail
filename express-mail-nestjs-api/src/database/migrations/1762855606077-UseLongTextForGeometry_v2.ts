import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseLongTextForGeometryV21762855606077
  implements MigrationInterface
{
  name = 'UseLongTextForGeometryV21762855606077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`vehicle_route\` DROP COLUMN \`geometry\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`vehicle_route\` ADD \`geometry\` longtext NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`vehicle_route\` DROP COLUMN \`geometry\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`vehicle_route\` ADD \`geometry\` text NOT NULL`,
    );
  }
}
