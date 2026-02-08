import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from './client.entity';
import { WashPlan } from './wash-plan.entity';

export enum ClientWashPlanStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

@Entity('client_wash_plans')
@Index(['clientId', 'washPlanId'], { unique: true })
export class ClientWashPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'wash_plan_id', type: 'uuid' })
  washPlanId: string;

  @ManyToOne(() => WashPlan, (plan) => plan.clientEnrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wash_plan_id' })
  washPlan: WashPlan;

  @Column({ name: 'enrolled_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  enrolledAt: Date;

  @Column({ type: 'varchar', length: 20 })
  status: ClientWashPlanStatus;
}
