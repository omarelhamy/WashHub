import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';
import { ClientSelect } from '@/components/ClientSelect';
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Car {
  id: string;
  plateNumber: string;
  model: string | null;
  color: string | null;
  clientId: string;
  client?: { id: string; name: string };
}

const PAGE_SIZE = 20;

export default function CarsList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const providerId = getProviderId();
  const location = useLocation();
  const stateClientId = (location.state as { clientId?: string } | null)?.clientId;

  const [clientId, setClientId] = useState<string>(stateClientId ?? '');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['cars', providerId, clientId || 'all', page],
    queryFn: async () => {
      const params = new URLSearchParams({ providerId: providerId!, page: String(page), limit: String(PAGE_SIZE) });
      if (clientId) params.set('clientId', clientId);
      const { data: res } = await api.get<{ items: Car[]; total: number; page: number; limit: number }>(`/cars?${params}`);
      return res;
    },
    enabled: !!providerId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cars/${id}?providerId=${providerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success(t('pages.carsList.removeSuccess'));
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to remove car');
    },
  });

  const handleRemove = (car: Car) => {
    if (!confirm(t('pages.carsList.confirmRemoveCar'))) return;
    deleteMutation.mutate(car.id);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.carsList.title')}</h1>
        <p className="text-muted-foreground text-sm mt-2">{t('pages.carsList.filterByClient')}</p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t('pages.carsList.filterByClient')}
          </CardTitle>
          <ClientSelect
            providerId={providerId}
            value={clientId}
            onChange={(id) => { setClientId(id); setPage(1); }}
            allowAll
            placeholder={t('components.clientSelect.allClients')}
            searchPlaceholder={t('pages.carsList.searchClient')}
            width="w-[280px]"
          />
        </CardHeader>
        <CardContent>
          {isLoading && <ListPageSkeleton rows={5} cols={5} />}
          {!isLoading && data && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('pages.carsList.plate')}</TableHead>
                    <TableHead>{t('pages.carsList.model')}</TableHead>
                    <TableHead>{t('pages.carsList.color')}</TableHead>
                    <TableHead>{t('pages.carsList.client')}</TableHead>
                    <TableHead className="w-[140px]">{t('pages.carsList.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {t('pages.carsList.noCars')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.items.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium">{car.plateNumber}</TableCell>
                        <TableCell>{car.model ?? '—'}</TableCell>
                        <TableCell>{car.color ?? '—'}</TableCell>
                        <TableCell>
                          <Link
                            to={`/provider/clients/${car.client?.id ?? car.clientId}`}
                            className="text-primary hover:underline"
                          >
                            {car.client?.name ?? car.clientId}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="size-8" asChild title={t('pages.carsList.viewClient')}>
                              <Link to={`/provider/clients/${car.client?.id ?? car.clientId}`}>
                                <Eye className="size-4" aria-hidden />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8" asChild title={t('pages.carsList.editCar')}>
                              <Link to={`/provider/cars/${car.id}/edit`}>
                                <Pencil className="size-4" aria-hidden />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              title={t('pages.carsList.removeCar')}
                              onClick={() => handleRemove(car)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {data.total > PAGE_SIZE && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t('common.total')}: {data.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="size-4" aria-hidden />
                      {t('pages.carsList.previousPage')}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {t('pages.carsList.pageOf', { current: page, total: totalPages })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      {t('pages.carsList.nextPage')}
                      <ChevronRight className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
