import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProviderUser } from './provider-user.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'subscription_plan', type: 'varchar', length: 50, default: 'FREE_TRIAL' })
  subscriptionPlan: string;

  @Column({ name: 'subscription_status', type: 'varchar', length: 50, default: 'ACTIVE' })
  subscriptionStatus: string;

  @Column({ name: 'trial_ends_at', type: 'timestamptz', nullable: true })
  trialEndsAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProviderUser, (user) => user.provider)
  users: ProviderUser[];
}
