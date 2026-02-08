import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Health } from './entities/health.entity';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ProvidersModule } from './providers/providers.module';
import { ProviderUsersModule } from './provider-users/provider-users.module';
import { ClientsModule } from './clients/clients.module';
import { CarsModule } from './cars/cars.module';
import { WashJobsModule } from './wash-jobs/wash-jobs.module';
import { WashStagesModule } from './wash-stages/wash-stages.module';
import { PaymentsModule } from './payments/payments.module';
import { WashPlansModule } from './wash-plans/wash-plans.module';
import { ClientCommentsModule } from './client-comments/client-comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PublicModule } from './public/public.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SuperModule } from './super/super.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: process.env.NODE_ENV !== 'production',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Health]),
    AuthModule,
    ProvidersModule,
    ProviderUsersModule,
    ClientsModule,
    CarsModule,
    WashJobsModule,
    WashStagesModule,
    PaymentsModule,
    WashPlansModule,
    ClientCommentsModule,
    NotificationsModule,
    PublicModule,
    SchedulerModule,
    SuperModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
