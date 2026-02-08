import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/ListPageSkeleton';
import { Users, ClipboardList, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProviderDashboard() {
  const { t } = useTranslation();
  const providerId = getProviderId();
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients', providerId],
    queryFn: async () => {
      const { data } = await api.get<{ items: unknown[]; total: number }>(`/clients?providerId=${providerId}&limit=10`);
      return data;
    },
    enabled: !!providerId,
  });
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['wash-jobs', providerId],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await api.get<{ items: unknown[]; total: number }>(`/wash-jobs?providerId=${providerId}&date=${today}&limit=10`);
      return data;
    },
    enabled: !!providerId,
  });

  if (clientsLoading || jobsLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.providerDashboard.title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">{t('pages.providerDashboard.subtitle')}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" /> {t('pages.providerDashboard.clients')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{clients?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ClipboardList className="size-4 text-primary" /> {t('pages.providerDashboard.todayJobs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{jobs?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CreditCard className="size-4 text-primary" /> {t('pages.providerDashboard.pendingPayments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-muted-foreground text-sm">{t('pages.providerDashboard.subtitle')}</p>
    </div>
  );
}
