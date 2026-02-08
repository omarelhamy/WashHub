import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Client {
  id: string;
  name: string;
  phone: string;
  enrolledAt: string | null;
  enrollmentCode: string | null;
}

interface Car {
  id: string;
  plateNumber: string;
  model: string | null;
  color: string | null;
}

interface Payment {
  id: string;
  amount: string;
  method: string;
  status: string;
  type: string;
  createdAt: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author?: { name?: string; phone?: string };
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const providerId = getProviderId();

  const { data: client, isLoading: clientLoading, error: clientError } = useQuery({
    queryKey: ['client', id, providerId],
    queryFn: async () => {
      const { data } = await api.get<Client>(`/clients/${id}?providerId=${providerId}`);
      return data;
    },
    enabled: !!id && !!providerId,
  });

  const { data: cars = [] } = useQuery({
    queryKey: ['cars', providerId, id],
    queryFn: async () => {
      const { data } = await api.get<Car[]>(`/cars?providerId=${providerId}&clientId=${id}`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!id && !!providerId,
  });

  const { data: paymentsData } = useQuery({
    queryKey: ['payments', providerId, id],
    queryFn: async () => {
      const { data } = await api.get<{ items: Payment[] }>(`/payments?providerId=${providerId}&clientId=${id}&limit=20`);
      return data;
    },
    enabled: !!id && !!providerId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['client-comments', id, providerId],
    queryFn: async () => {
      const { data } = await api.get<Comment[]>(`/client-comments?clientId=${id}&providerId=${providerId}`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!id && !!providerId,
  });

  const payments = paymentsData?.items ?? [];

  if (clientLoading || !client) {
    if (clientError) {
      return (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/provider/clients">← {t('pages.clientDetail.backToClients')}</Link>
          </Button>
          <p className="text-destructive">{t('pages.clientDetail.failedToLoad')}</p>
        </div>
      );
    }
    return <p className="text-muted-foreground">{t('common.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/provider/clients">← Back to clients</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{client.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Client details</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="text-muted-foreground">Phone:</span> {client.phone}</p>
          <p><span className="text-muted-foreground">Enrolled:</span> {client.enrolledAt ? new Date(client.enrolledAt).toLocaleDateString() : '—'}</p>
          {client.enrollmentCode && <p><span className="text-muted-foreground">Enrollment code:</span> {client.enrollmentCode}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t('pages.clientDetail.cars')}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/provider/cars" state={{ clientId: client.id }}>{t('pages.clientDetail.viewInCars')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {cars.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('pages.clientDetail.noCars')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Color</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.plateNumber}</TableCell>
                    <TableCell>{c.model ?? '—'}</TableCell>
                    <TableCell>{c.color ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t('pages.clientDetail.payments')}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/provider/payments">{t('common.viewAll')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('pages.clientDetail.noPayments')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.amount}</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t('pages.clientDetail.comments')}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/provider/client-comments">{t('pages.clientDetail.addViewComments')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('pages.clientDetail.noComments')}</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.slice(0, 5).map((c) => (
                <div key={c.id} className="border-l-2 border-border pl-3 py-1 text-sm">
                  <p className="text-muted-foreground">{c.author?.name ?? c.author?.phone ?? 'Unknown'} · {new Date(c.createdAt).toLocaleString()}</p>
                  <p className="whitespace-pre-wrap">{c.text}</p>
                </div>
              ))}
              {comments.length > 5 && <p className="text-muted-foreground text-sm">+{comments.length - 5} more. View all in Comments.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
