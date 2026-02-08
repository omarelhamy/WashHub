import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';
import { ArrowLeft, Users, ClipboardList, DollarSign, Settings, Package, Receipt } from 'lucide-react';

interface BillingSummary {
  carCount: number;
  pricePerCar: number;
  currency: string;
  totalAmount: number;
}

interface ProviderDetailResponse {
  provider: {
    id: string;
    name: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    enabled: boolean;
    settings: Record<string, unknown> | null;
    trialEndsAt: string | null;
  };
  clients: { id: string; name: string; phone: string }[];
  clientsTotal: number;
  washJobs: { id: string; status: string; scheduledAt: string; clientId: string }[];
  washJobsTotal: number;
  paymentsSummary: { totalPaid: string; totalPending: string; count: number };
  billingSummary?: BillingSummary;
  settings: Record<string, unknown> | null;
}

export default function SuperProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['super-provider-detail', id],
    queryFn: async () => {
      const { data: res } = await api.get<ProviderDetailResponse>(`/providers/${id}/detail`);
      return res;
    },
    enabled: !!id,
  });

  if (isLoading || !data) return <ListPageSkeleton rows={6} cols={4} />;

  const { provider, clients, washJobs, paymentsSummary, billingSummary, settings } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/super/providers">
            <ArrowLeft className="mr-2 size-4" /> {t('pages.superProviderDetail.backToProviders')}
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/super/providers/${id}/edit`}>{t('pages.superProviderDetail.editProvider')}</Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold">{provider.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="size-4" /> {t('pages.superProviderDetail.clients')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{data.clientsTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="size-4" /> {t('pages.superProviderDetail.washJobs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{data.washJobsTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="size-4" /> {t('pages.superProviderDetail.totalPaid')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{paymentsSummary.totalPaid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="size-4" /> {t('pages.superProviderDetail.totalPending')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{paymentsSummary.totalPending}</p>
          </CardContent>
        </Card>
      </div>

      {billingSummary != null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="size-4" /> {t('pages.superProviderDetail.platformInvoice')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t('pages.superProviderDetail.platformInvoiceDesc')}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">{t('pages.superProviderDetail.carsCount')}</dt>
              <dd className="font-medium">{billingSummary.carCount}</dd>
              <dt className="text-muted-foreground">{t('pages.superProviderDetail.pricePerCar')}</dt>
              <dd className="font-medium">{billingSummary.pricePerCar} {billingSummary.currency}</dd>
              <dt className="text-muted-foreground">{t('pages.superProviderDetail.invoiceTotal')}</dt>
              <dd className="font-bold text-primary">{billingSummary.totalAmount.toFixed(2)} {billingSummary.currency}</dd>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('pages.superProviderDetail.clients')}</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-muted-foreground">{t('pages.superProviderDetail.noClients')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pages.clientsList.name')}</TableHead>
                  <TableHead>{t('pages.clientsList.phone')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('pages.superProviderDetail.schedules')} / {t('pages.superProviderDetail.washJobs')}</CardTitle>
        </CardHeader>
        <CardContent>
          {washJobs.length === 0 ? (
            <p className="text-muted-foreground">{t('pages.superProviderDetail.noJobs')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pages.washJobsList.scheduled')}</TableHead>
                  <TableHead>{t('pages.washJobsList.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {washJobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell>{new Date(j.scheduledAt).toLocaleString()}</TableCell>
                    <TableCell>{j.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="size-4" /> {t('pages.superProviderDetail.providerSettings')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('pages.providersList.plan')}</dt>
              <dd>{provider.subscriptionPlan}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('pages.providersList.status')}</dt>
              <dd>{provider.subscriptionStatus}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('pages.providersList.enabled')}</dt>
              <dd>{provider.enabled ? 'Yes' : 'No'}</dd>
            </div>
            {provider.trialEndsAt && (
              <div>
                <dt className="text-muted-foreground">{t('pages.providersList.trialEndsAt')}</dt>
                <dd>{new Date(provider.trialEndsAt).toLocaleDateString()}</dd>
              </div>
            )}
            {settings && Object.keys(settings).length > 0 && (
              <div>
                <dt className="text-muted-foreground">Custom settings</dt>
                <dd>
                  <pre className="mt-1 p-2 rounded bg-muted text-xs overflow-auto max-h-40">
                    {JSON.stringify(settings, null, 2)}
                  </pre>
                </dd>
              </div>
            )}
          </dl>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link to={`/super/providers/${id}/edit`}>{t('pages.superProviderDetail.editProvider')}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="size-4" /> {t('pages.superProviderDetail.plans')}
          </CardTitle>
          <Button asChild size="sm">
            <Link to={`/super/providers/${id}/plans`}>{t('common.viewAll')}</Link>
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}
