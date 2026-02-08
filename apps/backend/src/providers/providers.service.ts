import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ClientsService } from '../clients/clients.service';
import { WashJobsService } from '../wash-jobs/wash-jobs.service';
import { PaymentsService } from '../payments/payments.service';
import { CarsService } from '../cars/cars.service';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly repo: Repository<Provider>,
    private readonly clientsService: ClientsService,
    private readonly washJobsService: WashJobsService,
    private readonly paymentsService: PaymentsService,
    private readonly carsService: CarsService,
  ) {}

  create(dto: CreateProviderDto) {
    const provider = this.repo.create({
      name: dto.name,
      subscriptionPlan: dto.subscriptionPlan ?? 'FREE_TRIAL',
      subscriptionStatus: dto.subscriptionStatus ?? 'ACTIVE',
      trialEndsAt: dto.trialEndsAt ? new Date(dto.trialEndsAt) : null,
      settings: dto.settings ?? null,
      enabled: dto.enabled ?? true,
    });
    return this.repo.save(provider);
  }

  async findAll(page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const provider = await this.repo.findOne({ where: { id } });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async update(id: string, dto: UpdateProviderDto) {
    const provider = await this.findOne(id);
    if (dto.name != null) provider.name = dto.name;
    if (dto.subscriptionPlan != null) provider.subscriptionPlan = dto.subscriptionPlan;
    if (dto.subscriptionStatus != null) provider.subscriptionStatus = dto.subscriptionStatus;
    if (dto.trialEndsAt != null) provider.trialEndsAt = new Date(dto.trialEndsAt);
    if (dto.settings != null) provider.settings = dto.settings;
    if (dto.enabled != null) provider.enabled = dto.enabled;
    return this.repo.save(provider);
  }

  async remove(id: string) {
    const provider = await this.findOne(id);
    await this.repo.remove(provider);
    return { deleted: true };
  }

  /** Super admin: full provider detail with clients, wash jobs, schedules, profit */
  async getSuperDetail(id: string) {
    const provider = await this.findOne(id);
    const [clients, washJobs, paymentsSummary, billingSummary] = await Promise.all([
      this.clientsService.findAll(id, 1, 50),
      this.washJobsService.findAll(id, 1, 30),
      this.paymentsService.getSummaryByProvider(id),
      this.getBillingSummary(id),
    ]);
    return {
      provider,
      clients: clients.items,
      clientsTotal: clients.total,
      washJobs: washJobs.items,
      washJobsTotal: washJobs.total,
      paymentsSummary,
      billingSummary,
      settings: provider.settings,
    };
  }

  /**
   * Billing: provider pays per car. Invoice = carCount × pricePerCar.
   * pricePerCar is set in provider.settings.pricePerCar (config per provider by super admin).
   */
  async getBillingSummary(providerId: string): Promise<{
    carCount: number;
    pricePerCar: number;
    currency: string;
    totalAmount: number;
  }> {
    const provider = await this.findOne(providerId);
    const carCount = await this.carsService.countByProvider(providerId);
    const settings = (provider.settings ?? {}) as Record<string, unknown>;
    const pricePerCar = Number(settings.pricePerCar) || 0;
    const currency = (settings.billingCurrency as string) || 'EGP';
    const totalAmount = carCount * pricePerCar;
    return { carCount, pricePerCar, currency, totalAmount };
  }
}
