import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
  sub: string;
  email?: string;
  providerId?: string;
  role?: string;
  type: 'SUPER_ADMIN' | 'PROVIDER_ADMIN' | 'PROVIDER_WORKER' | 'CLIENT';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = process.env.JWT_SECRET || config.get<string>('JWT_SECRET') || 'default-secret-change-me';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || typeof payload !== 'object') {
      throw new UnauthorizedException('Invalid token payload');
    }
    const sub = payload.sub;
    const type = payload.type;
    if (sub === undefined || sub === null || type === undefined || type === null) {
      throw new UnauthorizedException('Invalid token: missing sub or type');
    }
    return { ...payload, sub: String(sub), type };
  }
}
