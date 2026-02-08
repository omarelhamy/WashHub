import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  phone: string;
  providerId: string;
  provider?: { id: string; name: string };
  carsCount?: number;
}

interface ProviderOption {
  id: string;
  name: string;
}

export default function SuperClientsList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [providerId, setProviderId] = useState<string>('');

  const deleteMutation = useMutation({
    mutationFn: async ({ id, providerId: pid }: { id: string; providerId: string }) => {
      await api.delete(`/clients/${id}?providerId=${pid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-clients'] });
      toast.success(t('pages.superClientsList.removeSuccess'));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to remove client');
    },
  });

  const handleRemove = (c: Client) => {
    if (!confirm(t('pages.superClientsList.confirmRemove'))) return;
    deleteMutation.mutate({ id: c.id, providerId: c.providerId });
  };

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
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.superClientsList.title')}</h1>
      </header>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t('pages.superClientsList.filterByProvider')}</CardTitle>
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
                <TableHead>{t('pages.superClientsList.cars')}</TableHead>
                <TableHead className="w-[140px]">{t('pages.superClientsList.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.provider?.name ?? c.providerId}</TableCell>
                  <TableCell>{typeof c.carsCount === 'number' ? c.carsCount : '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" asChild title={t('pages.superClientsList.viewDetails')}>
                        <Link to={`/super/clients/${c.id}?providerId=${c.providerId}`}>
                          <Eye className="size-4" aria-hidden />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" asChild title={t('pages.superClientsList.edit')}>
                        <Link to={`/super/clients/${c.id}/edit?providerId=${c.providerId}`}>
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        title={t('pages.superClientsList.remove')}
                        onClick={() => handleRemove(c)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
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
