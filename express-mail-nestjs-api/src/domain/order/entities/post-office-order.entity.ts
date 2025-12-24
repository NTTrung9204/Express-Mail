import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { OrderPostOfficeStatus } from '../enums/order-post-office-status.enum';

@Entity('order_post_offices')
export class OrderPostOffice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.orderPostOffices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'post_office_id', length: 100 })
  postOfficeId: string;

  @Column({
    type: 'enum',
    enum: OrderPostOfficeStatus,
  })
  status: OrderPostOfficeStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
