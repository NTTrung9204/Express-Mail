import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRouteStepStatus1763309820735 implements MigrationInterface {
  name = 'AddRouteStepStatus1763309820735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const fk = await queryRunner.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'shipping' 
        AND COLUMN_NAME = 'route_step_id' 
        AND REFERENCED_TABLE_NAME = 'route_step'
    `);
    if (fk.length > 0) {
      await queryRunner.query(`
        ALTER TABLE \`shipping\` DROP FOREIGN KEY \`${fk[0].CONSTRAINT_NAME}\`
      `);
    }
    const index = await queryRunner.query(`
      SHOW INDEX FROM \`shipping\` WHERE Column_name='route_step_id' AND Non_unique=0
    `);
    if (index.length > 0) {
      await queryRunner.query(`
        DROP INDEX \`${index[0].Key_name}\` ON \`shipping\`
      `);
    }
    await queryRunner.query(`
      ALTER TABLE \`route_step\` 
      ADD \`status\` enum ('PENDING','FAILED','COMPLETED') NOT NULL DEFAULT 'PENDING'
    `);
    await queryRunner.query(`
      ALTER TABLE \`shipping\`
      ADD CONSTRAINT \`FK_shipping_route_step\` FOREIGN KEY (\`route_step_id\`) REFERENCES \`route_step\`(\`id\`) ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`shipping\` DROP FOREIGN KEY \`FK_shipping_route_step\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`route_step\` DROP COLUMN \`status\`
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX \`REL_9b9b2459145144bd50241d60c2\` ON \`shipping\` (\`route_step_id\`)
    `);
    await queryRunner.query(`
      ALTER TABLE \`shipping\`
      ADD CONSTRAINT \`FK_9b9b2459145144bd50241d60c26\` FOREIGN KEY (\`route_step_id\`) REFERENCES \`route_step\`(\`id\`) ON DELETE CASCADE
    `);
  }
}
