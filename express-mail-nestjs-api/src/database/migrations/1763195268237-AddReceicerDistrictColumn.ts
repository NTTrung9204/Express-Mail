import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReceicerDistrictColumn1763195268237
  implements MigrationInterface
{
  name = 'AddReceicerDistrictColumn1763195268237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`receiver_district\` varchar(100) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`receiver_district\``,
    );
  }
}
