import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { VehicleRoute } from './vehicle-route.entity';

@Entity('route_plan')
export class RoutePlan {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'post_office_id' })
  postOfficeId: number;

  @Column({ name: 'total_cost', type: 'double' })
  totalCost: number;

  @Column({ name: 'total_distance', type: 'double' })
  totalDistance: number;

  @Column({ name: 'total_duration', type: 'double' })
  totalDuration: number;

  @Column({ name: 'total_service_time', type: 'double' })
  totalServiceTime: number;

  @Column({ name: 'unassigned_count', type: 'int' })
  unassignedCount: number;

  @Column({ name: 'raw_response', type: 'json' })
  rawResponse: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => VehicleRoute, (vehicleRoute) => vehicleRoute.routePlan)
  vehicleRoutes: VehicleRoute[];
}
