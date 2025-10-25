import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/vi';
import { Product } from 'src/domain/product/entities/product.entity';
import { Order } from 'src/domain/order/entities/order.entity';

export default class ProductSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Product);
    const orderIds = Array.from({ length: 400 }, (_, i) => i + 1);
    const products: Partial<Product>[] = [];

    // Image placeholder services
    const imagePlaceholders = [
      'https://picsum.photos/200', // Random images
      'https://placehold.co/200x200', // Solid color placeholders
      'https://loremflickr.com/200/200/product', // Random product images
      'https://via.placeholder.com/200', // Simple placeholders
    ];

    for (const orderId of orderIds) {
      // Each order will have 1-5 products
      const numberOfProducts = faker.number.int({ min: 1, max: 5 });

      for (let i = 0; i < numberOfProducts; i++) {
        const createdAt = faker.date.between({
          from: new Date('2025-01-01'),
          to: new Date('2025-10-25'),
        });

        const updatedAt = faker.date.between({
          from: createdAt,
          to: new Date('2025-10-25'),
        });

        // Generate random product data
        const product = repository.create({
          order: { id: orderId } as Order,
          name: faker.commerce.productName(),
          quantity: faker.number.int({ min: 1, max: 10 }),
          weight: faker.number.float({
            min: 0.1,
            max: 5,
            fractionDigits: 2,
          }),
          // Add random query params to prevent image caching
          img_url: `${faker.helpers.arrayElement(imagePlaceholders)}?${faker.string.alphanumeric(8)}`,
          createdAt,
          updatedAt,
        });

        products.push(product);
      }
    }

    // Insert all products in batches of 50
    for (let i = 0; i < products.length; i += 50) {
      const batch = products.slice(i, i + 50);
      await repository.insert(batch);
    }

    const avgProducts = (products.length / orderIds.length).toFixed(2);
    console.log(
      `Seeded ${products.length} products for ${orderIds.length} orders (avg ${avgProducts} products per order)`,
    );
  }
}
