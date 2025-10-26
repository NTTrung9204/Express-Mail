import { Order } from 'src/domain/order/entities/order.entity';
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
import { ShippingStatus } from '../enums/shipping-status.enum';

@Entity('shipping')
export class Shipping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, name: 'shipper_id' })
  shipperId: string;

  @ManyToOne(() => Order, (order) => order.shipping, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    type: 'enum',
    enum: ShippingStatus,
  })
  status: ShippingStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
