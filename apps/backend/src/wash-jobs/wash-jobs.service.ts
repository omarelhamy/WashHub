import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WashJob } from '../entities/wash-job.entity';
import { WashJobStatus } from '../entities/wash-job.entity';
import { CreateWashJobDto } from './dto/create-wash-job.dto';
import { UpdateWashJobDto } from './dto/update-wash-job.dto';

@Injectable()
export class WashJobsService {
  constructor(
    @InjectRepository(WashJob)
    private readonly repo: Repository<WashJob>,
  ) {}

  async create(dto: CreateWashJobDto, providerId: string) {
    const job = this.repo.create({
      providerId: providerId || dto.providerId,
      clientId: dto.clientId,
      carId: dto.carId,
      assignedWorkerId: dto.assignedWorkerId ?? null,
      status: WashJobStatus.NOT_STARTED,
      scheduledAt: new Date(dto.scheduledAt),
    });
    return this.repo.save(job);
  }

  async findAll(providerId: string, page = 1, limit = 20, date?: string) {
    const qb = this.repo
      .createQueryBuilder('j')
      .where('j.providerId = :providerId', { providerId })
      .orderBy('j.scheduledAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (date) {
      qb.andWhere('DATE(j.scheduledAt) = :date', { date });
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string, providerId: string) {
    const job = await this.repo.findOne({
      where: { id, providerId },
      relations: ['client', 'car'],
    });
    if (!job) throw new NotFoundException('Wash job not found');
    return job;
  }

  async update(id: string, providerId: string, dto: UpdateWashJobDto) {
    const job = await this.findOne(id, providerId);
    if (dto.status != null) {
      job.status = dto.status as WashJobStatus;
      if (dto.status === 'IN_PROGRESS' && !job.startedAt) job.startedAt = new Date();
      if (dto.status === 'COMPLETED') job.completedAt = new Date();
    }
    if (dto.assignedWorkerId != null) job.assignedWorkerId = dto.assignedWorkerId;
    if (dto.scheduledAt != null) job.scheduledAt = new Date(dto.scheduledAt);
    return this.repo.save(job);
  }

  async remove(id: string, providerId: string) {
    const job = await this.findOne(id, providerId);
    await this.repo.remove(job);
    return { deleted: true };
  }
}
