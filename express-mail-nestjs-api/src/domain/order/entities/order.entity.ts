import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderPostOffice } from './post-office-order.entity';
import { ShippingStatus } from '../enums/shipping-status.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { Product } from 'src/domain/product/entities/product.entity';
import { OrderTransition } from './order-transition.entity';
import { Shipping } from 'src/domain/shipping/entities/shipping.entity';
import { RouteStep } from 'src/domain/plan/entities/route-step.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 8, unique: true })
  code: string;

  @Column({ name: 'shop_id', length: 50 })
  shopId: string;

  @Column({ name: 'shipping_fee_id', length: 100 })
  shippingFeeId: string;

  @Column({ length: 10 })
  receiver_phone: string;

  @Column({ length: 100 })
  receiver_province_city: string;

  @Column({ length: 100 })
  receiver_ward_commune: string;

  @Column({ length: 100 })
  receiver_address: string;

  @Column({ length: 100 })
  receiver_coordinate: string;

  @Column({ length: 100 })
  receiver_district: string;

  @Column('float')
  length: number;

  @Column('float')
  width: number;

  @Column('float')
  height: number;

  @Column('float')
  weight: number;

  @Column('float')
  cod: number;

  @Column('float')
  shipping_cost: number;

  @Column('float')
  shipping_cost_payper: number;

  @Column('boolean', { default: true })
  is_receiver_pay_shipping: boolean;

  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.PICKUP_REQUESTED,
  })
  shipping_status: ShippingStatus;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  order_status: OrderStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => OrderPostOffice, (opo) => opo.order)
  orderPostOffices: OrderPostOffice[];

  @OneToMany(() => Product, (product) => product.order)
  products: Product[];

  @OneToMany(() => OrderTransition, (transition) => transition.order)
  transitions: OrderTransition[];

  @OneToMany(() => Shipping, (shipping) => shipping.order)
  shipping: Shipping[];

  @OneToOne(() => RouteStep)
  @JoinColumn({ name: 'route_step_id' })
  routeStep: RouteStep;
}
