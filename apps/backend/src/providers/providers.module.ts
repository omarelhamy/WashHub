import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from '../entities/provider.entity';
import { ClientsModule } from '../clients/clients.module';
import { WashJobsModule } from '../wash-jobs/wash-jobs.module';
import { PaymentsModule } from '../payments/payments.module';
import { CarsModule } from '../cars/cars.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider]),
    ClientsModule,
    WashJobsModule,
    PaymentsModule,
    CarsModule,
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
