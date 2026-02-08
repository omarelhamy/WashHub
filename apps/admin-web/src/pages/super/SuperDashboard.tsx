import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ListPageSkeleton';
import { useTranslation } from 'react-i18next';
import { Building2, Users, ClipboardList, ArrowRight } from 'lucide-react';

interface Stats {
  providersCount: number;
  clientsCount: number;
  washJobsCount: number;
}

export default function SuperDashboard() {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['super', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<Stats>('/super/stats');
      return data;
    },
  });

  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data } = await api.get<{ items: { id: string; name: string }[]; total: number }>('/providers?limit=100');
      return data;
    },
  });

  const isLoading = statsLoading || providersLoading;
  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('pages.superDashboard.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="size-4" /> {t('pages.superDashboard.providers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats?.providersCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="size-4" /> {t('pages.superDashboard.clients')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats?.clientsCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="size-4" /> {t('pages.superDashboard.washJobs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats?.washJobsCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('nav.providers')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('pages.superDashboard.subtitle')}</p>
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link to="/super/providers">
                {t('common.viewAll')} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('nav.clients')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('pages.superDashboard.clientsSubtitle')}</p>
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link to="/super/clients">
                {t('common.viewAll')} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {(providers?.items?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('pages.superDashboard.recentProviders')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(providers?.items ?? []).slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link to={`/super/providers/${p.id}`} className="text-primary hover:underline flex items-center gap-2">
                    {p.name} <ArrowRight className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
