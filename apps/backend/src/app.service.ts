import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Health } from './entities/health.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Health)
    private readonly healthRepo: Repository<Health>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth(): Promise<{ status: string; db: string }> {
    await this.healthRepo.count();
    return { status: 'ok', db: 'connected' };
  }
}
