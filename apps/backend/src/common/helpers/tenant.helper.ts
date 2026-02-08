import { JwtPayload } from '../../auth/strategies/jwt.strategy';

export function getProviderIdFromUser(user: JwtPayload | undefined): string | null {
  if (!user) return null;
  if (user.type === 'SUPER_ADMIN') return null;
  return user.providerId ?? null;
}

export function requireProviderId(user: JwtPayload | undefined): string {
  const id = getProviderIdFromUser(user);
  if (!id) throw new Error('Provider context required');
  return id;
}
