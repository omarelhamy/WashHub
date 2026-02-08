import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Client {
  id: string;
  name: string;
  phone: string;
  providerId: string;
  provider?: { id: string; name: string };
}

interface ProviderOption {
  id: string;
  name: string;
}

export default function SuperClientsList() {
  const { t } = useTranslation();
  const [providerId, setProviderId] = useState<string>('');

  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data } = await api.get<{ items: ProviderOption[] }>('/providers?limit=200');
      return data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['super-clients', providerId || 'all'],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (providerId) params.set('providerId', providerId);
      const { data } = await api.get<{ items: Client[]; total: number }>(`/clients?${params}`);
      return data;
    },
  });

  if (isLoading) return <ListPageSkeleton rows={8} cols={4} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('pages.superClientsList.title')}</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">{t('pages.superClientsList.filterByProvider')}</CardTitle>
          <Select value={providerId || 'all'} onValueChange={(v) => setProviderId(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('pages.superClientsList.filterByProvider')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.viewAll')}</SelectItem>
              {(providers?.items ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pages.superClientsList.name')}</TableHead>
                <TableHead>{t('pages.superClientsList.phone')}</TableHead>
                <TableHead>{t('pages.superClientsList.provider')}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>
                    {c.provider ? (
                      <Link to={`/super/providers/${c.provider.id}`} className="text-primary hover:underline">
                        {c.provider.name}
                      </Link>
                    ) : (
                      c.providerId
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/super/providers/${c.providerId}`}>{t('common.viewAll')}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">
        {t('common.total')}: {data?.total ?? 0}
      </p>
    </div>
  );
}
