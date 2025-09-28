import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatabaseConfig1758732187236 implements MigrationInterface {
  name = 'DatabaseConfig1758732187236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`order_post_offices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`post_office_id\` varchar(100) NOT NULL, \`status\` enum ('CLASSIFIED', 'IN_WAREHOUSE') NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`order_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`quantity\` int NOT NULL, \`weight\` float NOT NULL, \`img_url\` varchar(100) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`order_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`order_transitions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`current_post_office\` varchar(255) NULL, \`next_post_office\` varchar(255) NULL, \`status\` enum ('TRANSITING', 'PENDING') NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`order_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(8) NOT NULL, \`shop_id\` varchar(50) NOT NULL, \`shipping_fee_id\` varchar(100) NOT NULL, \`receiver_phone\` varchar(10) NOT NULL, \`receiver_province_city\` varchar(100) NOT NULL, \`receiver_ward_commune\` varchar(100) NOT NULL, \`receiver_address\` varchar(100) NOT NULL, \`receiver_coordinate\` varchar(100) NOT NULL, \`length\` float NOT NULL, \`width\` float NOT NULL, \`height\` float NOT NULL, \`weight\` float NOT NULL, \`cod\` float NOT NULL, \`shipping_cost\` float NOT NULL, \`shipping_cost_payper\` float NOT NULL, \`shipping_status\` enum ('PICKUP_REQUESTED', 'IN_TRANSIT', 'CLASSIFIED', 'IN_WAREHOUSE', 'SHIPPING') NOT NULL DEFAULT 'PICKUP_REQUESTED', \`order_status\` enum ('PENDING', 'CANCELED', 'COMPLETED') NOT NULL DEFAULT 'PENDING', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, UNIQUE INDEX \`IDX_3e413c10c595c04c6c70e58a4d\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`shipping\` (\`id\` int NOT NULL AUTO_INCREMENT, \`shipper_id\` varchar(100) NOT NULL, \`status\` enum ('PICKUP_REQUESTED', 'SHIPPING', 'RETURNING') NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`order_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_post_offices\` ADD CONSTRAINT \`FK_4976bf9c6ed5e6db521b9366436\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_89a3b9463601304d3892116c187\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_transitions\` ADD CONSTRAINT \`FK_6530d75c96f49eb9e7a9a36072d\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shipping\` ADD CONSTRAINT \`FK_a37456893780ce2dfe0a7484c22\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`shipping\` DROP FOREIGN KEY \`FK_a37456893780ce2dfe0a7484c22\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_transitions\` DROP FOREIGN KEY \`FK_6530d75c96f49eb9e7a9a36072d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_89a3b9463601304d3892116c187\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_post_offices\` DROP FOREIGN KEY \`FK_4976bf9c6ed5e6db521b9366436\``,
    );
    await queryRunner.query(`DROP TABLE \`shipping\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_3e413c10c595c04c6c70e58a4d\` ON \`orders\``,
    );
    await queryRunner.query(`DROP TABLE \`orders\``);
    await queryRunner.query(`DROP TABLE \`order_transitions\``);
    await queryRunner.query(`DROP TABLE \`products\``);
    await queryRunner.query(`DROP TABLE \`order_post_offices\``);
  }
}
