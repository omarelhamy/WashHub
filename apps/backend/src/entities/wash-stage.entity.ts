import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WashJob } from './wash-job.entity';

export enum WashStageType {
  ARRIVED = 'ARRIVED',
  WASHING = 'WASHING',
  FINISHING = 'FINISHING',
}

@Entity('wash_stages')
export class WashStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wash_job_id', type: 'uuid' })
  washJobId: string;

  @ManyToOne(() => WashJob, (job) => job.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wash_job_id' })
  washJob: WashJob;

  @Column({ type: 'varchar', length: 20 })
  stage: WashStageType;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
