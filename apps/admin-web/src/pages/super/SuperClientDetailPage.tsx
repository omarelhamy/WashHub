import { useParams, Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  providerId: string;
  provider?: { id: string; name: string };
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

export default function SuperClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('providerId') ?? '';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/clients/${id}?providerId=${providerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-clients'] });
      toast.success(t('pages.superClientDetail.removeSuccess'));
      navigate('/super/clients');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to remove client');
    },
  });

  const payments = paymentsData?.items ?? [];

  if (!providerId || !id) return <Navigate to="/super/clients" replace />;

  if (clientLoading || !client) {
    if (clientError) {
      return (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/super/clients">← {t('pages.superClientDetail.backToClients')}</Link>
          </Button>
          <p className="text-destructive">{t('pages.clientDetail.failedToLoad')}</p>
        </div>
      );
    }
    return <p className="text-muted-foreground">{t('common.loading')}</p>;
  }

  const handleRemove = () => {
    if (!confirm(t('pages.superClientDetail.confirmRemove'))) return;
    deleteMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/super/clients">← {t('pages.superClientDetail.backToClients')}</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/super/clients/${id}/edit?providerId=${providerId}`}>
            <Pencil className="size-4 mr-2" aria-hidden />
            {t('pages.superClientDetail.edit')}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleRemove}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="size-4 mr-2" aria-hidden />
          {t('pages.superClientDetail.remove')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{client.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('pages.superClientDetail.clientDetails')}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="text-muted-foreground">{t('pages.clientDetail.phone')}:</span> {client.phone}</p>
          <p><span className="text-muted-foreground">{t('pages.superClientDetail.provider')}:</span> {client.provider?.name ?? client.providerId}</p>
          <p><span className="text-muted-foreground">{t('pages.clientDetail.enrolled')}:</span> {client.enrolledAt ? new Date(client.enrolledAt).toLocaleDateString() : '—'}</p>
          {client.enrollmentCode && <p><span className="text-muted-foreground">{t('pages.clientDetail.enrollmentCode')}:</span> {client.enrollmentCode}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('pages.clientDetail.cars')}</CardTitle>
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
        <CardHeader>
          <CardTitle className="text-base">{t('pages.clientDetail.payments')}</CardTitle>
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
        <CardHeader>
          <CardTitle className="text-base">{t('pages.clientDetail.comments')}</CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('pages.clientDetail.noComments')}</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.slice(0, 10).map((c) => (
                <div key={c.id} className="border-l-2 border-border pl-3 py-1 text-sm">
                  <p className="text-muted-foreground">{c.author?.name ?? c.author?.phone ?? 'Unknown'} · {new Date(c.createdAt).toLocaleString()}</p>
                  <p className="whitespace-pre-wrap">{c.text}</p>
                </div>
              ))}
              {comments.length > 10 && <p className="text-muted-foreground text-sm">+{comments.length - 10} more</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
