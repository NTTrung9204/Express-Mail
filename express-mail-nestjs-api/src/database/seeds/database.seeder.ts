import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import OrderSeeder from './order.seed';
import ShippingSeeder from './shipping.seed';
import PostOfficeAndTransitionSeeder from './post-office-and-transition.seed';
import ProductSeeder from './product.seed';

export default class DatabaseSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    // Run seeders in sequence
    await new OrderSeeder().run(dataSource);
    await new ProductSeeder().run(dataSource); // Add products right after orders
    await new ShippingSeeder().run(dataSource);
    await new PostOfficeAndTransitionSeeder().run(dataSource);

    console.log('✅ Database seeding completed');
  }
}
