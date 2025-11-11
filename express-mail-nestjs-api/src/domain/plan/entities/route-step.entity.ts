import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { VehicleRoute } from './vehicle-route.entity';
import { Order } from '../../order/entities/order.entity';
import { Shipping } from 'src/domain/shipping/entities/shipping.entity';

export enum RouteStepType {
  START = 'start',
  JOB = 'job',
  END = 'end',
}

@Entity('route_step')
export class RouteStep {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'step_order', type: 'int' })
  stepOrder: number;

  @Column({
    type: 'enum',
    enum: RouteStepType,
  })
  type: RouteStepType;

  @Column({ name: 'job_id', type: 'int', nullable: true })
  jobId: number | null;

  @Column({ type: 'double' })
  lat: number;

  @Column({ type: 'double' })
  lng: number;

  @Column({ type: 'double' })
  arrival: number;

  @Column({ type: 'double' })
  duration: number;

  @Column({ type: 'double' })
  distance: number;

  @Column({ type: 'int' })
  load: number;

  @Column({ name: 'service_time', type: 'double' })
  serviceTime: number;

  @Column({ name: 'waiting_time', type: 'double' })
  waitingTime: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => VehicleRoute, (vehicleRoute) => vehicleRoute.routeSteps)
  @JoinColumn({ name: 'vehicle_route_id' })
  vehicleRoute: VehicleRoute;

  @OneToOne(() => Order, (order) => order.routeStep)
  order: Order;

  @OneToOne(() => Shipping, (shipping) => shipping.routeStep)
  shipping: Shipping;
}
