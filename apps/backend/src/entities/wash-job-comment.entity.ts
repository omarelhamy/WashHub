import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { WashJob } from './wash-job.entity';

@Entity('wash_job_comments')
@Index(['washJobId'])
export class WashJobComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wash_job_id', type: 'uuid' })
  washJobId: string;

  @ManyToOne(() => WashJob, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wash_job_id' })
  washJob: WashJob;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
