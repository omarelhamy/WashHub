import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import twilio from 'twilio';
import { PlatformUser } from '../entities/platform-user.entity';
import { ProviderUser } from '../entities/provider-user.entity';
import { Client } from '../entities/client.entity';
import { ProviderUserRole } from '../entities/provider-user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

const DEV_OTP = '0000';
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PlatformUser)
    private readonly platformUserRepo: Repository<PlatformUser>,
    @InjectRepository(ProviderUser)
    private readonly providerUserRepo: Repository<ProviderUser>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    private readonly jwtService: JwtService,
  ) {}

  async loginSuperAdmin(email: string, password: string) {
    const user = await this.platformUserRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'SUPER_ADMIN',
    };
    return { access_token: this.jwtService.sign(payload) };
  }

  async loginProviderUser(phone: string, password: string) {
    const users = await this.providerUserRepo.find({ where: { phone } });
    for (const user of users) {
      if (await bcrypt.compare(password, user.passwordHash)) {
        const type =
          user.role === ProviderUserRole.ADMIN ? 'PROVIDER_ADMIN' : 'PROVIDER_WORKER';
        const payload: JwtPayload = {
          sub: user.id,
          providerId: user.providerId,
          role: user.role,
          type,
        };
        return { access_token: this.jwtService.sign(payload) };
      }
    }
    throw new UnauthorizedException('Invalid phone or password');
  }

  async requestOtp(phone: string, providerId: string) {
    const isDev =
      process.env.DEV_MODE === 'true' ||
      process.env.NODE_ENV === 'development';
    if (isDev) {
      return { sent: true, message: 'OTP would be sent (dev mode)' };
    }
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!accountSid || !authToken || !verifySid) {
      throw new BadRequestException('Twilio not configured');
    }
    const client = twilio(accountSid, authToken);
    await client.verify.v2.services(verifySid).verifications.create({
      to: phone,
      channel: 'sms',
    });
    return { sent: true };
  }

  async verifyOtp(phone: string, code: string, providerId: string) {
    const isDev =
      process.env.DEV_MODE === 'true' ||
      process.env.NODE_ENV === 'development';
    if (!isDev) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
      if (!accountSid || !authToken || !verifySid) {
        throw new BadRequestException('Twilio not configured');
      }
      const client = twilio(accountSid, authToken);
      const verification = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: phone, code });
      if (verification.status !== 'approved') {
        throw new UnauthorizedException('Invalid or expired code');
      }
    } else {
      if (code !== DEV_OTP) {
        throw new UnauthorizedException('Invalid code (use 0000 in dev)');
      }
    }

    let clientEntity = await this.clientRepo.findOne({
      where: { phone, providerId },
    });
    if (!clientEntity) {
      clientEntity = this.clientRepo.create({
        phone,
        providerId,
        name: phone,
        enrolledAt: new Date(),
      });
      await this.clientRepo.save(clientEntity);
    }

    const payload: JwtPayload = {
      sub: clientEntity.id,
      providerId,
      type: 'CLIENT',
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
