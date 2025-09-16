import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { OrderTransitionStatus } from '../enums/order-transition-status.enum';

@Entity({ name: 'order_transitions' })
export class OrderTransition {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.transitions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'current_post_office', nullable: true })
  currentPostOfficeId: string;

  @Column({ name: 'next_post_office', nullable: true })
  nextPostOfficeId: string;

  @Column({
    type: 'enum',
    enum: OrderTransitionStatus,
  })
  status: OrderTransitionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
