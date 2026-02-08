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
import { Car } from './car.entity';

@Entity('clients')
@Index(['providerId'])
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'enrolled_at', type: 'timestamptz', nullable: true })
  enrolledAt: Date | null;

  @Column({ name: 'enrollment_code', type: 'varchar', length: 50, nullable: true })
  enrollmentCode: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Car, (car) => car.client)
  cars: Car[];
}
