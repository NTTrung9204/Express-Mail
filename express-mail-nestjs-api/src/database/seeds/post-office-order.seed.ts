import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/vi';
import { OrderPostOffice } from 'src/domain/order/entities/post-office-order.entity';
import { OrderPostOfficeStatus } from 'src/domain/order/enums/order-post-office-status.enum';
import { Order } from 'src/domain/order/entities/order.entity';

export default class PostOfficeOrderSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(OrderPostOffice);
    const postOfficeIds = [
      '11',
      '12',
      '13',
      '14',
      '15',
      '17',
      '18',
      '19',
      '20',
      '5',
      '16',
      '29',
      '40',
      '2',
      '41',
      '24',
      '30',
      '7',
      '28',
      '4',
      '8',
      '21',
      '27',
      '42',
      '3',
      '23',
      '26',
      '22',
      '31',
      '9',
      '25',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '38',
      '39',
      '43',
      '44',
      '45',
      '46',
      '47',
      '48',
      '1',
      '10',
      '49',
      '50',
      '51',
      '6',
      '53',
      '52',
    ];
    const orderIds = Array.from({ length: 400 }, (_, i) => i + 1);
    const records: Partial<OrderPostOffice>[] = [];

    for (const orderId of orderIds) {
      // Decide how many post offices this order will go through (1-5)
      const numberOfOffices = faker.number.int({ min: 1, max: 5 });

      // Select random post offices for this order
      const selectedOffices = faker.helpers.arrayElements(
        postOfficeIds,
        numberOfOffices,
      );

      // Base timestamp for this order's journey
      const baseDate = faker.date.between({
        from: new Date('2025-01-01'),
        to: new Date('2025-10-25'),
      });

      // Process each post office for this order
      selectedOffices.forEach((postOfficeId, index) => {
        // Calculate timestamp for this post office
        // Each subsequent office adds 2-4 hours from the previous one
        const timestamp = new Date(
          baseDate.getTime() +
            index * faker.number.int({ min: 2, max: 4 }) * 60 * 60 * 1000,
        );

        let status: OrderPostOfficeStatus;

        if (numberOfOffices === 1) {
          // If only one office, randomly choose any status
          status = faker.helpers.arrayElement(
            Object.values(OrderPostOfficeStatus),
          );
        } else {
          if (index === selectedOffices.length - 1) {
            // Last office gets either IN_WAREHOUSE or CLASSIFIED
            status = faker.helpers.arrayElement([
              OrderPostOfficeStatus.IN_WAREHOUSE,
              OrderPostOfficeStatus.CLASSIFIED,
            ]);
          } else {
            // Previous offices are always CLASSIFIED
            status = OrderPostOfficeStatus.CLASSIFIED;
          }
        }

        const record = repository.create({
          order: { id: orderId } as Order,
          postOfficeId,
          status,
          created_at: timestamp,
          updated_at: timestamp,
        });

        records.push(record);
      });
    }

    // Insert all records in batches of 50
    for (let i = 0; i < records.length; i += 50) {
      const batch = records.slice(i, i + 50);
      await repository.insert(batch);
    }

    const totalOffices = new Set(records.map((r) => r.postOfficeId)).size;
    console.log(
      `Seeded ${records.length} post office order records for ${orderIds.length} orders across ${totalOffices} post offices\n` +
        `Average of ${(records.length / orderIds.length).toFixed(2)} post offices per order`,
    );
  }
}
