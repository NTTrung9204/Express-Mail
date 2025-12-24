import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/vi';
import { Shipping } from 'src/domain/shipping/entities/shipping.entity';
import { ShippingStatus } from 'src/domain/shipping/enums/shipping-status.enum';
import { Order } from 'src/domain/order/entities/order.entity';

export default class ShippingSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Shipping);
    const shipperIds = [
      '35',
      '36',
      '38',
      '39',
      '42',
      '5',
      '9',
      '12',
      '18',
      '30',
      '48',
      '20',
      '27',
    ];
    const orderIds = Array.from({ length: 400 }, (_, i) => i + 1);
    const shippings: Partial<Shipping>[] = [];

    // Randomly decide how many orders will reach each stage
    const pickupRequestedRate = 0.9; // 90% of orders get picked up
    const shippingRate = 0.7; // 70% of picked up orders get shipped
    const returningRate = 0.15; // 15% of shipped orders get returned

    for (const orderId of orderIds) {
      const shipperId = faker.helpers.arrayElement(shipperIds);

      // Base timestamp for this order's shipping process
      const baseDate = faker.date.between({
        from: new Date('2025-01-01'),
        to: new Date('2025-10-25'),
      });

      // Decide if this order gets picked up
      if (Math.random() < pickupRequestedRate) {
        const pickupDate = baseDate;
        const pickupShipping = repository.create({
          shipperId,
          order: { id: orderId } as Order,
          status: ShippingStatus.PICKUP_REQUESTED,
          createdAt: pickupDate,
          updatedAt: pickupDate,
        });
        shippings.push(pickupShipping);

        // Decide if this order moves to shipping stage
        if (Math.random() < shippingRate) {
          // Add 1-4 hours for shipping stage
          const shippingDate = new Date(
            pickupDate.getTime() +
              faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000,
          );
          const shippingStatus = repository.create({
            shipperId,
            order: { id: orderId } as Order,
            status: ShippingStatus.SHIPPING,
            createdAt: shippingDate,
            updatedAt: shippingDate,
          });
          shippings.push(shippingStatus);

          // Decide if this order gets returned
          if (Math.random() < returningRate) {
            // Add 2-6 hours for return stage
            const returningDate = new Date(
              shippingDate.getTime() +
                faker.number.int({ min: 2, max: 6 }) * 60 * 60 * 1000,
            );
            const returningStatus = repository.create({
              shipperId,
              order: { id: orderId } as Order,
              status: ShippingStatus.RETURNING,
              createdAt: returningDate,
              updatedAt: returningDate,
            });
            shippings.push(returningStatus);
          }
        }
      }
    }

    // Insert all shipping records in batches of 50
    for (let i = 0; i < shippings.length; i += 50) {
      const batch = shippings.slice(i, i + 50);
      await repository.insert(batch);
    }

    console.log(
      `Seeded ${shippings.length} shipping records for ${orderIds.length} orders`,
    );
  }
}
