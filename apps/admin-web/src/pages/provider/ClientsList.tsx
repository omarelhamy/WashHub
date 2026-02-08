import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';

interface Client {
  id: string;
  name: string;
  phone: string;
  enrolledAt: string | null;
}

export default function ClientsList() {
  const { t } = useTranslation();
  const providerId = getProviderId();
  const { data, isLoading } = useQuery({
    queryKey: ['clients', providerId],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: Client[]; total: number }>(`/clients?providerId=${providerId}&limit=50`);
      return res;
    },
    enabled: !!providerId,
  });

  if (isLoading) return <ListPageSkeleton rows={5} cols={3} />;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.clientsList.title')}</h1>
        <p className="text-muted-foreground text-sm mt-2">{t('pages.clientsList.allClients')}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('pages.clientsList.allClients')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pages.clientsList.name')}</TableHead>
                <TableHead>{t('pages.clientsList.phone')}</TableHead>
                <TableHead>{t('pages.clientsList.enrolled')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                <Link to={`/provider/clients/${c.id}`} className="text-primary hover:underline font-medium">
                  {c.name}
                </Link>
              </TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.enrolledAt ? new Date(c.enrolledAt).toLocaleDateString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">{t('common.total')}: {data?.total ?? 0}.</p>
    </div>
  );
}
