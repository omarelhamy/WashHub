export type UserType = 'SUPER_ADMIN' | 'PROVIDER_ADMIN' | 'PROVIDER_WORKER' | 'CLIENT';

export interface JwtPayload {
  sub: string;
  email?: string;
  providerId?: string;
  role?: string;
  type: UserType;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function clearToken(): void {
  localStorage.removeItem('token');
}

export function getPayload(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  return parseJwt(token);
}

export function getUserType(): UserType | null {
  return getPayload()?.type ?? null;
}

export function getProviderId(): string | null {
  return getPayload()?.providerId ?? null;
}

export function isSuperAdmin(): boolean {
  return getUserType() === 'SUPER_ADMIN';
}

export function isProviderAdmin(): boolean {
  return getUserType() === 'PROVIDER_ADMIN';
}

export function isWorker(): boolean {
  return getUserType() === 'PROVIDER_WORKER';
}
