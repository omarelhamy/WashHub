import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WashStage } from '../entities/wash-stage.entity';
import { WashStageType } from '../entities/wash-stage.entity';
import { WashJob } from '../entities/wash-job.entity';

@Injectable()
export class WashStagesService {
  constructor(
    @InjectRepository(WashStage)
    private readonly repo: Repository<WashStage>,
    @InjectRepository(WashJob)
    private readonly jobRepo: Repository<WashJob>,
  ) {}

  async create(washJobId: string, stage: WashStageType, providerId: string) {
    const job = await this.jobRepo.findOne({
      where: { id: washJobId, providerId },
    });
    if (!job) throw new NotFoundException('Wash job not found');
    const stageEntity = this.repo.create({ washJobId, stage });
    return this.repo.save(stageEntity);
  }

  async findByJob(washJobId: string, providerId: string) {
    const job = await this.jobRepo.findOne({
      where: { id: washJobId, providerId },
    });
    if (!job) throw new NotFoundException('Wash job not found');
    return this.repo.find({
      where: { washJobId },
      order: { timestamp: 'ASC' },
    });
  }
}
