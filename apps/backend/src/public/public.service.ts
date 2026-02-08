import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../entities/provider.entity';
import { Client } from '../entities/client.entity';
import { Car } from '../entities/car.entity';
import { WashPlan } from '../entities/wash-plan.entity';
import { ClientWashPlan, ClientWashPlanStatus } from '../entities/client-wash-plan.entity';
import { EnrollDto } from './dto/enroll.dto';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Car)
    private readonly carRepo: Repository<Car>,
    @InjectRepository(WashPlan)
    private readonly washPlanRepo: Repository<WashPlan>,
    @InjectRepository(ClientWashPlan)
    private readonly clientWashPlanRepo: Repository<ClientWashPlan>,
  ) {}

  /** Resolve provider from enrollment code (code = first 8 chars of provider id) or first enabled */
  private async getProviderForCode(code: string): Promise<Provider> {
    const trimmed = code?.trim() ?? '';
    if (trimmed.length >= 8) {
      const provider = await this.providerRepo
        .createQueryBuilder('p')
        .where('p.enabled = :enabled', { enabled: true })
        .andWhere('CAST(p.id AS TEXT) LIKE :pattern', { pattern: `${trimmed}%` })
        .getOne();
      if (provider) return provider;
    }
    const provider = await this.providerRepo.findOne({
      where: { enabled: true },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  /** Public: get provider and its wash plans for enrollment (by code) */
  async getEnrollInfo(code: string) {
    const provider = await this.getProviderForCode(code);
    const plans = await this.washPlanRepo.find({
      where: { providerId: provider.id },
      order: { name: 'ASC' },
      select: ['id', 'name', 'timesPerWeek', 'location', 'washesInPlan'],
    });
    return {
      provider: { id: provider.id, name: provider.name },
      plans: plans.map((p) => ({ id: p.id, name: p.name, timesPerWeek: p.timesPerWeek, location: p.location, washesInPlan: p.washesInPlan })),
    };
  }

  async enroll(dto: EnrollDto) {
    const provider = await this.getProviderForCode(dto.code);
    const enrollmentCode = dto.code.trim() || provider.id.slice(0, 8);
    let client = await this.clientRepo.findOne({
      where: { phone: dto.phone, providerId: provider.id },
    });
    if (!client) {
      client = this.clientRepo.create({
        providerId: provider.id,
        name: dto.name,
        phone: dto.phone,
        address: dto.address?.trim() || null,
        enrollmentCode,
        enrolledAt: new Date(),
      });
      await this.clientRepo.save(client);
    } else if (dto.address !== undefined) {
      client.address = dto.address?.trim() || null;
      await this.clientRepo.save(client);
    }
    const carsToAdd: { plateNumber: string; model: string | null; color: string | null }[] = [];
    if (dto.cars?.length) {
      for (const c of dto.cars) {
        if (c.plateNumber?.trim()) {
          carsToAdd.push({
            plateNumber: c.plateNumber.trim(),
            model: c.model?.trim() ?? null,
            color: c.color?.trim() ?? null,
          });
        }
      }
    }
    if (dto.plateNumber?.trim() && !carsToAdd.some((c) => c.plateNumber === dto.plateNumber!.trim())) {
      carsToAdd.push({
        plateNumber: dto.plateNumber.trim(),
        model: dto.model?.trim() ?? null,
        color: dto.color?.trim() ?? null,
      });
    }
    for (const { plateNumber, model, color } of carsToAdd) {
      const existingCar = await this.carRepo.findOne({
        where: { clientId: client.id, plateNumber },
      });
      if (!existingCar) {
        const car = this.carRepo.create({
          clientId: client.id,
          plateNumber,
          model,
          color,
        });
        await this.carRepo.save(car);
      }
    }

    if (dto.planIds?.length) {
      for (const planId of dto.planIds) {
        const plan = await this.washPlanRepo.findOne({
          where: { id: planId, providerId: provider.id },
        });
        if (plan) {
          const existing = await this.clientWashPlanRepo.findOne({
            where: { washPlanId: planId, clientId: client.id },
          });
          if (!existing) {
            const enrollment = this.clientWashPlanRepo.create({
              washPlanId: planId,
              clientId: client.id,
              status: ClientWashPlanStatus.ACTIVE,
            });
            await this.clientWashPlanRepo.save(enrollment);
          }
        }
      }
    }

    return {
      provider: { id: provider.id, name: provider.name },
      client: { id: client.id, name: client.name, phone: client.phone },
    };
  }
}
