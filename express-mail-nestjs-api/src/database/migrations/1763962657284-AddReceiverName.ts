import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReceiverName1763962657284 implements MigrationInterface {
    name = 'AddReceiverName1763962657284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`receiver_name\` varchar(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`receiver_name\``);
    }

}
