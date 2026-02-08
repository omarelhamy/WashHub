import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type AuthRole = 'SUPER_ADMIN' | 'PROVIDER_ADMIN' | 'PROVIDER_WORKER' | 'CLIENT';

export const Roles = (...roles: AuthRole[]) => SetMetadata(ROLES_KEY, roles);
