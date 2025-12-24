import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseLongTextForGeometry1762855126282 implements MigrationInterface {
  name = 'UseLongTextForGeometry1762855126282';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_9602bfeab0dfe9419294c19420\` ON \`orders\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_9602bfeab0dfe9419294c19420\` ON \`orders\` (\`route_step_id\`)`,
    );
  }
}
