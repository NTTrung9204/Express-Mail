import { OrderStatus } from 'src/domain/order/enums/order-status.enum';
import { ShippingStatus } from 'src/domain/order/enums/shipping-status.enum';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/vi';
import { Order } from 'src/domain/order/entities/order.entity';
import { CreateOrderDto, CreateProductForOrderDto } from 'src/domain/order/dto';

export default class OrderSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Order);
    const shopIds = [4, 6, 10, 11, 26, 37, 51, 31];
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-10-25');
    const orders: Order[] = [];

    for (const shopId of shopIds) {
      // Generate 50 orders for each shop
      for (let i = 0; i < 50; i++) {
        const createdAt = faker.date.between({ from: startDate, to: endDate });
        const updatedAt = faker.date.between({ from: createdAt, to: endDate });

        const lat = faker.number.float({
          min: 8.4,
          max: 23.4,
          fractionDigits: 6,
        });

        const lng = faker.number.float({
          min: 102.1,
          max: 109.5,
          fractionDigits: 6,
        });

        const length = faker.number.float({
          min: 10,
          max: 100,
          fractionDigits: 1,
        });

        const width = faker.number.float({
          min: 10,
          max: 100,
          fractionDigits: 1,
        });

        const height = faker.number.float({
          min: 5,
          max: 50,
          fractionDigits: 1,
        });

        const weight = faker.number.float({
          min: 0.1,
          max: 20,
          fractionDigits: 1,
        });

        // Generate random products for the order
        const numProducts = faker.number.int({ min: 1, max: 5 });
        const products: CreateProductForOrderDto[] = Array.from(
          { length: numProducts },
          () => ({
            name: faker.commerce.productName(),
            quantity: faker.number.int({ min: 1, max: 10 }),
            weight: faker.number.float({
              min: 0.1,
              max: 5,
              fractionDigits: 1,
            }),
            img_url: faker.image.url(),
          }),
        );

        const orderDto: CreateOrderDto = {
          receiver_phone: '09' + faker.string.numeric(8),
          receiver_province_city: faker.location.city(),
          receiver_ward_commune: faker.location.street(),
          receiver_address: faker.location.streetAddress(),
          receiver_coordinate: `${lat},${lng}`,
          receiver_district: faker.location.county(),
          receiver_name: faker.person.fullName(),
          length,
          width,
          height,
          weight,
          cod: faker.number.int({ min: 50000, max: 2000000 }),
          is_receiver_pay_shipping: faker.datatype.boolean(),
          products,
        };

        // Add entity-specific fields before inserting
        const orderEntity = repository.create({
          ...orderDto,
          code: faker.string.alphanumeric(8).toUpperCase(),
          shopId: shopId.toString(),
          shipping_status: faker.helpers.arrayElement(
            Object.values(ShippingStatus),
          ),
          order_status: faker.helpers.arrayElement(Object.values(OrderStatus)),
          created_at: createdAt,
          updated_at: updatedAt,
          deleted_at: null,
        });

        orders.push(orderEntity);
      }
    }

    // Insert all orders in batches of 50
    for (let i = 0; i < orders.length; i += 50) {
      const batch = orders.slice(i, i + 50);
      await repository.insert(batch);
    }

    console.log(`Seeded ${orders.length} orders for ${shopIds.length} shops`);
  }
}
