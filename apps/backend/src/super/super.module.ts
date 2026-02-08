import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperController } from './super.controller';
import { SuperService } from './super.service';
import { Provider } from '../entities/provider.entity';
import { Client } from '../entities/client.entity';
import { WashJob } from '../entities/wash-job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Client, WashJob])],
  controllers: [SuperController],
  providers: [SuperService],
  exports: [SuperService],
})
export class SuperModule {}
