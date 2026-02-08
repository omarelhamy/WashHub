import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Provider } from './provider.entity';
import { ClientWashPlan } from './client-wash-plan.entity';

export enum WashPlanLocation {
  INSIDE = 'INSIDE',
  OUTSIDE = 'OUTSIDE',
}

@Entity('wash_plans')
@Index(['providerId'])
export class WashPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'days_of_week', type: 'int', array: true })
  daysOfWeek: number[];

  @Column({ name: 'times_per_week', type: 'int' })
  timesPerWeek: number;

  @Column({ type: 'varchar', length: 20 })
  location: WashPlanLocation;

  @Column({ name: 'washes_in_plan', type: 'int' })
  washesInPlan: number;

  @Column({ name: 'period_weeks', type: 'int', nullable: true })
  periodWeeks: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ClientWashPlan, (cwp) => cwp.washPlan)
  clientEnrollments: ClientWashPlan[];
}
