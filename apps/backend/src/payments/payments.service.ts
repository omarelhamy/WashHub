import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  async create(dto: CreatePaymentDto, providerId: string) {
    const payment = this.repo.create({
      providerId: providerId || dto.providerId,
      clientId: dto.clientId,
      washJobId: dto.washJobId ?? null,
      amount: String(dto.amount),
      method: dto.method as any,
      status: dto.status as any,
      type: (dto.type as any) ?? 'ONE_TIME',
      periodMonth: dto.periodMonth ?? null,
      periodYear: dto.periodYear ?? null,
    });
    return this.repo.save(payment);
  }

  async findAll(providerId: string, page = 1, limit = 20, clientId?: string) {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.providerId = :providerId', { providerId })
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (clientId) qb.andWhere('p.clientId = :clientId', { clientId });
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string, providerId: string) {
    const payment = await this.repo.findOne({ where: { id, providerId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  /** Sum paid/pending amounts for a provider (profit summary) */
  async getSummaryByProvider(providerId: string): Promise<{ totalPaid: string; totalPending: string; count: number }> {
    const result = await this.repo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(CASE WHEN p.status = :paid THEN CAST(p.amount AS DECIMAL) ELSE 0 END), 0)', 'totalPaid')
      .addSelect('COALESCE(SUM(CASE WHEN p.status = :pending THEN CAST(p.amount AS DECIMAL) ELSE 0 END), 0)', 'totalPending')
      .addSelect('COUNT(*)', 'count')
      .where('p.providerId = :providerId', { providerId })
      .setParameters({ paid: 'PAID', pending: 'PENDING' })
      .getRawOne<{ totalpaid: string; totalpending: string; count: string }>();
    const raw = result as Record<string, unknown> | undefined;
    return {
      totalPaid: (raw?.totalPaid ?? raw?.totalpaid ?? '0') as string,
      totalPending: (raw?.totalPending ?? raw?.totalpending ?? '0') as string,
      count: parseInt(String(raw?.count ?? '0'), 10),
    };
  }
}
