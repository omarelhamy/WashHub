import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../../auth/strategies/jwt.strategy';

@Injectable()
export class ProviderScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload; body?: { providerId?: string }; params?: { providerId?: string } }>();
    const user = request.user as JwtPayload | undefined;
    if (!user) return false;
    if (user.type === 'SUPER_ADMIN') return true;
    const providerId =
      request.body?.providerId ?? request.params?.providerId ?? user.providerId;
    if (user.type === 'CLIENT' || user.type === 'PROVIDER_ADMIN' || user.type === 'PROVIDER_WORKER') {
      if (providerId && providerId !== user.providerId) {
        throw new ForbiddenException('Access denied to this provider');
      }
    }
    return true;
  }
}
