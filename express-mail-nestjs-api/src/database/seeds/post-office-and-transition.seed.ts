import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/vi';
import { OrderPostOffice } from 'src/domain/order/entities/post-office-order.entity';
import { OrderTransition } from 'src/domain/order/entities/order-transition.entity';
import { OrderPostOfficeStatus } from 'src/domain/order/enums/order-post-office-status.enum';
import { OrderTransitionStatus } from 'src/domain/order/enums/order-transition-status.enum';
import { Order } from 'src/domain/order/entities/order.entity';

interface PostOfficeTransition {
  postOffices: { id: string; timestamp: Date }[];
  transitions: {
    fromId: string;
    toId: string;
    status: OrderTransitionStatus;
    timestamp: Date;
  }[];
}

export default class PostOfficeAndTransitionSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const postOfficeRepository = dataSource.getRepository(OrderPostOffice);
    const transitionRepository = dataSource.getRepository(OrderTransition);

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

    const postOfficeRecords: Partial<OrderPostOffice>[] = [];
    const transitionRecords: Partial<OrderTransition>[] = [];

    // Generate consistent journey for each order
    for (const orderId of orderIds) {
      const journey = this.generateOrderJourney(postOfficeIds);
      const { postOffices, transitions } = journey;

      // Create post office records
      postOffices.forEach((office, index) => {
        let status: OrderPostOfficeStatus;

        if (postOffices.length === 1) {
          // If only one office, randomly choose any status
          status = faker.helpers.arrayElement(
            Object.values(OrderPostOfficeStatus),
          );
        } else {
          if (index === postOffices.length - 1) {
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

        const postOfficeRecord = postOfficeRepository.create({
          order: { id: orderId } as Order,
          postOfficeId: office.id,
          status,
          created_at: office.timestamp,
          updated_at: office.timestamp,
        });

        postOfficeRecords.push(postOfficeRecord);
      });

      // Create transition records
      transitions.forEach((transition) => {
        const transitionRecord = transitionRepository.create({
          order: { id: orderId } as Order,
          currentPostOfficeId: transition.fromId,
          nextPostOfficeId: transition.toId,
          status: transition.status,
          createdAt: transition.timestamp,
          updatedAt: transition.timestamp,
        });

        transitionRecords.push(transitionRecord);
      });
    }

    // Insert all post office records in batches of 50
    for (let i = 0; i < postOfficeRecords.length; i += 50) {
      const batch = postOfficeRecords.slice(i, i + 50);
      await postOfficeRepository.insert(batch);
    }

    // Insert all transition records in batches of 50
    for (let i = 0; i < transitionRecords.length; i += 50) {
      const batch = transitionRecords.slice(i, i + 50);
      await transitionRepository.insert(batch);
    }

    const avgOffices = (postOfficeRecords.length / orderIds.length).toFixed(2);
    const avgTransitions = (transitionRecords.length / orderIds.length).toFixed(
      2,
    );

    console.log(
      `Seeded ${postOfficeRecords.length} post office records (avg ${avgOffices} per order)\n` +
        `Seeded ${transitionRecords.length} transition records (avg ${avgTransitions} per order)\n` +
        `Total orders processed: ${orderIds.length}`,
    );
  }

  private generateOrderJourney(postOfficeIds: string[]): PostOfficeTransition {
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

    // Generate timestamps for each office and transition
    const postOffices = selectedOffices.map((id, index) => {
      const timestamp = new Date(
        baseDate.getTime() +
          index * faker.number.int({ min: 2, max: 4 }) * 60 * 60 * 1000,
      );
      return { id, timestamp };
    });

    // Generate transitions between offices
    const transitions: Array<{
      fromId: string;
      toId: string;
      status: OrderTransitionStatus;
      timestamp: Date;
    }> = [];

    for (let i = 0; i < postOffices.length - 1; i++) {
      const fromOffice = postOffices[i];
      const toOffice = postOffices[i + 1];

      // Transition timestamp is between the two office timestamps
      const transitionTime = new Date(
        fromOffice.timestamp.getTime() +
          (toOffice.timestamp.getTime() - fromOffice.timestamp.getTime()) / 2,
      );

      // Determine transition status based on timestamps
      let status: OrderTransitionStatus;
      const now = new Date('2025-10-25'); // Current date

      if (transitionTime > now) {
        status = OrderTransitionStatus.PENDING;
      } else if (i === postOffices.length - 2) {
        // Last transition
        status = faker.helpers.arrayElement([
          OrderTransitionStatus.TRANSITING,
          OrderTransitionStatus.DONE,
        ]);
      } else {
        // Previous transitions are always DONE
        status = OrderTransitionStatus.DONE;
      }

      transitions.push({
        fromId: fromOffice.id,
        toId: toOffice.id,
        status,
        timestamp: transitionTime,
      });
    }

    return { postOffices, transitions };
  }
}
