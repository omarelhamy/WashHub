import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WashPlan } from '../entities/wash-plan.entity';
import { ClientWashPlan } from '../entities/client-wash-plan.entity';
import { ClientWashPlanStatus } from '../entities/client-wash-plan.entity';
import { CreateWashPlanDto } from './dto/create-wash-plan.dto';
import { UpdateWashPlanDto } from './dto/update-wash-plan.dto';

@Injectable()
export class WashPlansService {
  constructor(
    @InjectRepository(WashPlan)
    private readonly planRepo: Repository<WashPlan>,
    @InjectRepository(ClientWashPlan)
    private readonly enrollmentRepo: Repository<ClientWashPlan>,
  ) {}

  async create(dto: CreateWashPlanDto, providerId: string) {
    const plan = this.planRepo.create({
      providerId: providerId || dto.providerId,
      name: dto.name,
      daysOfWeek: dto.daysOfWeek,
      timesPerWeek: dto.timesPerWeek,
      location: dto.location as any,
      washesInPlan: dto.washesInPlan,
      periodWeeks: dto.periodWeeks ?? null,
    });
    return this.planRepo.save(plan);
  }

  async findAll(providerId: string, page = 1, limit = 20) {
    const [items, total] = await this.planRepo.findAndCount({
      where: { providerId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async findOne(id: string, providerId: string) {
    const plan = await this.planRepo.findOne({ where: { id, providerId } });
    if (!plan) throw new NotFoundException('Wash plan not found');
    return plan;
  }

  async enrollClient(washPlanId: string, clientId: string, providerId: string) {
    const plan = await this.findOne(washPlanId, providerId);
    const existing = await this.enrollmentRepo.findOne({
      where: { washPlanId, clientId },
    });
    if (existing) return existing;
    const enrollment = this.enrollmentRepo.create({
      washPlanId,
      clientId,
      status: ClientWashPlanStatus.ACTIVE,
    });
    return this.enrollmentRepo.save(enrollment);
  }

  async removeEnrollment(washPlanId: string, clientId: string, providerId: string) {
    await this.findOne(washPlanId, providerId);
    const enrollment = await this.enrollmentRepo.findOne({
      where: { washPlanId, clientId },
    });
    if (enrollment) await this.enrollmentRepo.remove(enrollment);
    return { deleted: true };
  }

  async getEnrolledClients(washPlanId: string, providerId: string) {
    await this.findOne(washPlanId, providerId);
    return this.enrollmentRepo.find({
      where: { washPlanId },
      relations: ['client'],
    });
  }

  async update(id: string, providerId: string, dto: UpdateWashPlanDto) {
    const plan = await this.findOne(id, providerId);
    if (dto.name != null) plan.name = dto.name;
    if (dto.daysOfWeek != null) plan.daysOfWeek = dto.daysOfWeek;
    if (dto.timesPerWeek != null) plan.timesPerWeek = dto.timesPerWeek;
    if (dto.location != null) plan.location = dto.location as any;
    if (dto.washesInPlan != null) plan.washesInPlan = dto.washesInPlan;
    if (dto.periodWeeks !== undefined) plan.periodWeeks = dto.periodWeeks;
    return this.planRepo.save(plan);
  }

  async remove(id: string, providerId: string) {
    const plan = await this.findOne(id, providerId);
    await this.planRepo.remove(plan);
    return { deleted: true };
  }
}
