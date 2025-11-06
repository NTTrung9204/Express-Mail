import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRouteShipping1762441559526 implements MigrationInterface {
    name = 'AddRouteShipping1762441559526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`route_plan\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`post_office_id\` int NOT NULL, \`total_cost\` double NOT NULL, \`total_distance\` double NOT NULL, \`total_duration\` double NOT NULL, \`total_service_time\` double NOT NULL, \`unassigned_count\` int NOT NULL, \`raw_response\` json NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vehicle_route\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`vehicle_id\` varchar(50) NOT NULL, \`cost\` double NOT NULL, \`distance\` double NOT NULL, \`duration\` double NOT NULL, \`service_time\` double NOT NULL, \`geometry\` text NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`route_plan_id\` bigint NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`route_step\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`step_order\` int NOT NULL, \`type\` enum ('start', 'job', 'end') NOT NULL, \`job_id\` int NULL, \`lat\` double NOT NULL, \`lng\` double NOT NULL, \`arrival\` double NOT NULL, \`duration\` double NOT NULL, \`distance\` double NOT NULL, \`load\` int NOT NULL, \`service_time\` double NOT NULL, \`waiting_time\` double NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`vehicle_route_id\` bigint NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`route_step_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD UNIQUE INDEX \`IDX_9602bfeab0dfe9419294c19420\` (\`route_step_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_9602bfeab0dfe9419294c19420\` ON \`orders\` (\`route_step_id\`)`);
        await queryRunner.query(`ALTER TABLE \`vehicle_route\` ADD CONSTRAINT \`FK_2b8e9a734bd5812e111576b2de2\` FOREIGN KEY (\`route_plan_id\`) REFERENCES \`route_plan\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`route_step\` ADD CONSTRAINT \`FK_125df03cdf925376c0d1f181276\` FOREIGN KEY (\`vehicle_route_id\`) REFERENCES \`vehicle_route\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_9602bfeab0dfe9419294c194201\` FOREIGN KEY (\`route_step_id\`) REFERENCES \`route_step\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_9602bfeab0dfe9419294c194201\``);
        await queryRunner.query(`ALTER TABLE \`route_step\` DROP FOREIGN KEY \`FK_125df03cdf925376c0d1f181276\``);
        await queryRunner.query(`ALTER TABLE \`vehicle_route\` DROP FOREIGN KEY \`FK_2b8e9a734bd5812e111576b2de2\``);
        await queryRunner.query(`DROP INDEX \`REL_9602bfeab0dfe9419294c19420\` ON \`orders\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP INDEX \`IDX_9602bfeab0dfe9419294c19420\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`route_step_id\``);
        await queryRunner.query(`DROP TABLE \`route_step\``);
        await queryRunner.query(`DROP TABLE \`vehicle_route\``);
        await queryRunner.query(`DROP TABLE \`route_plan\``);
    }

}
