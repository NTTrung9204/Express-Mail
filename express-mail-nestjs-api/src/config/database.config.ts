import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { SeederOptions } from 'typeorm-extension';
dotenv.config();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/src/**/*.entity.{js,ts}'],
  migrations: ['dist/src/database/migrations/*.{js,ts}'],
  seeds: ['dist/src/database/seeds/**/*.{js,ts}'],
  factories: ['dist/src/database/factories/**/*.js'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
