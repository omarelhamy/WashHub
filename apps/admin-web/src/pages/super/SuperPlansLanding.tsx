import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';
import { useTranslation } from 'react-i18next';
import { Package, ChevronRight } from 'lucide-react';

interface ProviderOption {
  id: string;
  name: string;
}

export default function SuperPlansLanding() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: ProviderOption[] }>('/providers?limit=200');
      return res;
    },
  });

  if (isLoading) return <ListPageSkeleton rows={6} cols={1} />;

  const providers = data?.items ?? [];

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.superPlans.title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">{t('pages.superPlans.selectProvider')}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {providers.map((p) => (
          <Link key={p.id} to={`/super/providers/${p.id}/plans`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="size-4 text-primary" />
                  {p.name}
                </CardTitle>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-sm text-muted-foreground">{t('pages.superPlans.managePlans')}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {providers.length === 0 && (
        <p className="text-muted-foreground">{t('common.noResults')}</p>
      )}
    </div>
  );
}
