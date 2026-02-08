import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUserType } from '@/lib/auth';

type Allowed = 'SUPER_ADMIN' | 'PROVIDER_ADMIN' | 'PROVIDER_WORKER';

interface ProtectedRouteProps {
  allowed: Allowed[];
}

export default function ProtectedRoute({ allowed }: ProtectedRouteProps) {
  const token = getToken();
  const type = getUserType();
  if (!token) return <Navigate to="/login" replace />;
  if (!type || !allowed.includes(type as Allowed)) return <Navigate to="/login" replace />;
  return <Outlet />;
}
