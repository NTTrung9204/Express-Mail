import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShippingOrderStatus1763312142908 implements MigrationInterface {
    name = 'AddShippingOrderStatus1763312142908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shipping\` DROP FOREIGN KEY \`FK_shipping_route_step\``);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`shipping_status\` \`shipping_status\` enum ('PICKUP_REQUESTED', 'IN_TRANSIT', 'CLASSIFIED', 'IN_WAREHOUSE', 'SHIPPING', 'PICKUP_FAILED', 'DELIVERY_FAILED', 'RETURNING', 'FINISHED') NOT NULL DEFAULT 'PICKUP_REQUESTED'`);
        await queryRunner.query(`ALTER TABLE \`shipping\` ADD CONSTRAINT \`FK_9b9b2459145144bd50241d60c26\` FOREIGN KEY (\`route_step_id\`) REFERENCES \`route_step\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shipping\` DROP FOREIGN KEY \`FK_9b9b2459145144bd50241d60c26\``);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`shipping_status\` \`shipping_status\` enum ('PICKUP_REQUESTED', 'IN_TRANSIT', 'CLASSIFIED', 'IN_WAREHOUSE', 'SHIPPING') NOT NULL DEFAULT 'PICKUP_REQUESTED'`);
        await queryRunner.query(`ALTER TABLE \`shipping\` ADD CONSTRAINT \`FK_shipping_route_step\` FOREIGN KEY (\`route_step_id\`) REFERENCES \`route_step\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
