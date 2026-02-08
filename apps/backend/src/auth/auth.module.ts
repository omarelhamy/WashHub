import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PlatformUser } from '../entities/platform-user.entity';
import { ProviderUser } from '../entities/provider-user.entity';
import { Client } from '../entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlatformUser, ProviderUser, Client]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const secret = process.env.JWT_SECRET || config.get<string>('JWT_SECRET') || 'default-secret-change-me';
        const expiresIn = (process.env.JWT_EXPIRY || config.get<string>('JWT_EXPIRY') || '7d') as '7d';
        return { secret, signOptions: { expiresIn } };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
