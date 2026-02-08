import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WashJob } from '../entities/wash-job.entity';
import { WashJobStatus } from '../entities/wash-job.entity';
import { CreateWashJobDto } from './dto/create-wash-job.dto';
import { UpdateWashJobDto } from './dto/update-wash-job.dto';
import { WashPlan } from '../entities/wash-plan.entity';
import { ClientWashPlan, ClientWashPlanStatus } from '../entities/client-wash-plan.entity';
import { Car } from '../entities/car.entity';
import { WashJobComment } from '../entities/wash-job-comment.entity';

@Injectable()
export class WashJobsService {
  constructor(
    @InjectRepository(WashJob)
    private readonly repo: Repository<WashJob>,
    @InjectRepository(WashJobComment)
    private readonly commentRepo: Repository<WashJobComment>,
    @InjectRepository(WashPlan)
    private readonly planRepo: Repository<WashPlan>,
    @InjectRepository(ClientWashPlan)
    private readonly enrollmentRepo: Repository<ClientWashPlan>,
    @InjectRepository(Car)
    private readonly carRepo: Repository<Car>,
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

  async findAll(
    providerId: string,
    page = 1,
    limit = 20,
    date?: string,
    sortBy: 'scheduledAt' | 'status' | 'clientName' | 'carPlate' = 'scheduledAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const qb = this.repo
      .createQueryBuilder('j')
      .leftJoinAndSelect('j.client', 'client')
      .leftJoinAndSelect('j.car', 'car')
      .leftJoinAndSelect('j.comments', 'comments')
      .where('j.providerId = :providerId', { providerId })
      .skip((page - 1) * limit)
      .take(limit);
    if (date) {
      const dayStart = new Date(date + 'T00:00:00.000Z');
      const dayEnd = new Date(date + 'T23:59:59.999Z');
      qb.andWhere('j.scheduledAt >= :dayStart', { dayStart }).andWhere('j.scheduledAt <= :dayEnd', { dayEnd });
    }
    const orderDir = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    if (sortBy === 'clientName') qb.orderBy('client.name', orderDir);
    else if (sortBy === 'carPlate') qb.orderBy('car.plate_number', orderDir);
    else if (sortBy === 'status') qb.orderBy('j.status', orderDir);
    else qb.orderBy('j.scheduledAt', orderDir);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  /**
   * Auto-generate wash jobs for a given date based on active plan enrollments
   * and each plan's daysOfWeek (0=Sun, 1=Mon, ... 6=Sat).
   * Only creates jobs for client-car pairs that don't already have a job on that date (no duplicates).
   * dateStr (YYYY-MM-DD) is used so filtering by that same date returns these jobs.
   */
  async generateDailyJobsForDate(date: Date): Promise<{ created: number; skipped: number }> {
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = new Date(dateStr + 'T12:00:00.000Z').getDay();
    const scheduledAt = new Date(dateStr + 'T08:00:00.000Z');
    const dayStart = new Date(dateStr + 'T00:00:00.000Z');
    const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

    const plans = await this.planRepo
      .createQueryBuilder('p')
      .where(':day = ANY(p.daysOfWeek)', { day: dayOfWeek })
      .getMany();
    if (plans.length === 0) return { created: 0, skipped: 0 };

    const planIds = plans.map((p) => p.id);
    const enrollments = await this.enrollmentRepo.find({
      where: {
        washPlanId: In(planIds),
        status: ClientWashPlanStatus.ACTIVE,
      },
      relations: ['washPlan'],
    });

    let created = 0;
    let skipped = 0;
    for (const enr of enrollments) {
      const plan = enr.washPlan;
      const providerId = plan.providerId;
      const cars = await this.carRepo.find({ where: { clientId: enr.clientId } });
      for (const car of cars) {
        const existing = await this.repo
          .createQueryBuilder('j')
          .where('j.providerId = :providerId', { providerId })
          .andWhere('j.clientId = :clientId', { clientId: enr.clientId })
          .andWhere('j.carId = :carId', { carId: car.id })
          .andWhere('j.scheduledAt >= :dayStart', { dayStart })
          .andWhere('j.scheduledAt <= :dayEnd', { dayEnd })
          .getOne();
        if (existing) {
          skipped++;
          continue;
        }
        await this.repo.save(
          this.repo.create({
            providerId,
            clientId: enr.clientId,
            carId: car.id,
            status: WashJobStatus.NOT_STARTED,
            scheduledAt,
          }),
        );
        created++;
      }
    }
    return { created, skipped };
  }

  async findOne(id: string, providerId: string) {
    const job = await this.repo.findOne({
      where: { id, providerId },
      relations: ['client', 'car', 'comments'],
    });
    if (!job) throw new NotFoundException('Wash job not found');
    if (job.comments?.length) {
      (job.comments as WashJobComment[]).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return job;
  }

  async addComment(washJobId: string, text: string, providerId: string) {
    await this.findOne(washJobId, providerId);
    const comment = this.commentRepo.create({ washJobId, text });
    return this.commentRepo.save(comment);
  }

  async getComments(washJobId: string, providerId: string) {
    await this.findOne(washJobId, providerId);
    return this.commentRepo.find({
      where: { washJobId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateComment(washJobId: string, commentId: string, text: string, providerId: string) {
    await this.findOne(washJobId, providerId);
    const comment = await this.commentRepo.findOne({ where: { id: commentId, washJobId } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.text = text;
    return this.commentRepo.save(comment);
  }

  async deleteComment(washJobId: string, commentId: string, providerId: string) {
    await this.findOne(washJobId, providerId);
    const comment = await this.commentRepo.findOne({ where: { id: commentId, washJobId } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentRepo.remove(comment);
    return { deleted: true };
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
