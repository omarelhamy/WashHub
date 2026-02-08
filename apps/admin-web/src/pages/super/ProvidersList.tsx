import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';
import { useTranslation } from 'react-i18next';
import { Plus, ArrowRight } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  enabled: boolean;
  trialEndsAt: string | null;
}

export default function ProvidersList() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: Provider[]; total: number }>('/providers?limit=50');
      return res;
    },
  });

  if (isLoading) return <ListPageSkeleton rows={5} cols={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('pages.providersList.title')}</h1>
        <Button asChild>
          <Link to="/super/providers/new">
            <Plus className="mr-2 size-4" /> {t('pages.providersList.createProvider')}
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('pages.providersList.allProviders')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pages.providersList.name')}</TableHead>
                <TableHead>{t('pages.providersList.plan')}</TableHead>
                <TableHead>{t('pages.providersList.status')}</TableHead>
                <TableHead>{t('pages.providersList.enabled')}</TableHead>
                <TableHead>{t('pages.providersList.trialEndsAt')}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link to={`/super/providers/${p.id}`} className="font-medium text-primary hover:underline">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell>{p.subscriptionPlan}</TableCell>
                  <TableCell>{p.subscriptionStatus}</TableCell>
                  <TableCell>{p.enabled ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{p.trialEndsAt ? new Date(p.trialEndsAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/super/providers/${p.id}`}>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">{t('common.total')}: {data?.total ?? 0}</p>
    </div>
  );
}
