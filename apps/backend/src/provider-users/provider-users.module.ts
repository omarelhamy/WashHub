import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderUser } from '../entities/provider-user.entity';
import { ProviderUsersService } from './provider-users.service';
import { ProviderUsersController } from './provider-users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderUser])],
  controllers: [ProviderUsersController],
  providers: [ProviderUsersService],
  exports: [ProviderUsersService],
})
export class ProviderUsersModule {}
