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

  @Column('varchar', {
    name: 'current_post_office',
    length: 255,
    nullable: true,
  })
  currentPostOfficeId: string | null;

  @Column('varchar', { name: 'next_post_office', length: 255, nullable: true })
  nextPostOfficeId: string | null;

  @Column({
    type: 'enum',
    enum: OrderTransitionStatus,
    default: OrderTransitionStatus.PENDING,
  })
  status: OrderTransitionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
