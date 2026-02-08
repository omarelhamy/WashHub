import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../entities/provider.entity';
import { Client } from '../entities/client.entity';
import { WashJob } from '../entities/wash-job.entity';

@Injectable()
export class SuperService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(WashJob)
    private readonly washJobRepo: Repository<WashJob>,
  ) {}

  async getStats(): Promise<{ providersCount: number; clientsCount: number; washJobsCount: number }> {
    const [providersCount, clientsCount, washJobsCount] = await Promise.all([
      this.providerRepo.count(),
      this.clientRepo.count(),
      this.washJobRepo.count(),
    ]);
    return { providersCount, clientsCount, washJobsCount };
  }
}
