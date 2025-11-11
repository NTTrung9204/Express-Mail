import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { RoutePlan } from './route-plan.entity';
import { RouteStep } from './route-step.entity';

@Entity('vehicle_route')
export class VehicleRoute {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'vehicle_id', type: 'varchar', length: 50, nullable: true })
  vehicleId: string | null;

  @Column({ type: 'double' })
  cost: number;

  @Column({ type: 'double' })
  distance: number;

  @Column({ type: 'double' })
  duration: number;

  @Column({ name: 'service_time', type: 'double' })
  serviceTime: number;

  @Column({ type: 'longtext' })
  geometry: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => RoutePlan, (routePlan) => routePlan.vehicleRoutes)
  @JoinColumn({ name: 'route_plan_id' })
  routePlan: RoutePlan;

  @OneToMany(() => RouteStep, (routeStep) => routeStep.vehicleRoute)
  routeSteps: RouteStep[];
}
