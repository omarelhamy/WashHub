import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from '../entities/provider.entity';
import { Client } from '../entities/client.entity';
import { Car } from '../entities/car.entity';
import { WashPlan } from '../entities/wash-plan.entity';
import { ClientWashPlan } from '../entities/client-wash-plan.entity';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Client, Car, WashPlan, ClientWashPlan])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
