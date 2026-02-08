import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface WashPlan {
  id: string;
  name: string;
  daysOfWeek: number[];
  timesPerWeek: number;
  location: string;
  washesInPlan: number;
  periodWeeks?: number | null;
}

const PAGE_SIZE = 20;

export default function WashPlansList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const providerId = getProviderId();

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState<WashPlan | null>(null);
  const [formName, setFormName] = useState('');
  const [formDays, setFormDays] = useState<number[]>([]);
  const [formTimesPerWeek, setFormTimesPerWeek] = useState(1);
  const [formLocation, setFormLocation] = useState<string>('INSIDE');
  const [formWashesInPlan, setFormWashesInPlan] = useState(1);
  const [formPeriodWeeks, setFormPeriodWeeks] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['wash-plans', providerId, page],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: WashPlan[]; total: number; page: number; limit: number }>(
        `/wash-plans?providerId=${providerId}&page=${page}&limit=${PAGE_SIZE}`
      );
      return res;
    },
    enabled: !!providerId,
  });

  const createMutation = useMutation({
    mutationFn: async (body: { name: string; daysOfWeek: number[]; timesPerWeek: number; location: string; washesInPlan: number; periodWeeks?: number }) => {
      await api.post(`/wash-plans?providerId=${providerId}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-plans'] });
      toast.success(t('pages.washPlansList.createSuccess'));
      closeModal();
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e?.response?.data?.message ?? 'Failed to create plan'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: { name: string; daysOfWeek: number[]; timesPerWeek: number; location: string; washesInPlan: number; periodWeeks?: number | null } }) => {
      await api.patch(`/wash-plans/${id}?providerId=${providerId}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-plans'] });
      toast.success(t('pages.washPlansList.updateSuccess'));
      closeModal();
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e?.response?.data?.message ?? 'Failed to update plan'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/wash-plans/${id}?providerId=${providerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-plans'] });
      toast.success(t('pages.washPlansList.removeSuccess'));
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e?.response?.data?.message ?? 'Failed to delete plan'),
  });

  const openAddModal = () => {
    setModalPlan(null);
    setFormName('');
    setFormDays([]);
    setFormTimesPerWeek(1);
    setFormLocation('INSIDE');
    setFormWashesInPlan(1);
    setFormPeriodWeeks('');
    setIsModalOpen(true);
  };

  const openEditModal = (plan: WashPlan) => {
    setModalPlan(plan);
    setFormName(plan.name);
    setFormDays([...plan.daysOfWeek].sort((a, b) => a - b));
    setFormTimesPerWeek(plan.timesPerWeek);
    setFormLocation(plan.location);
    setFormWashesInPlan(plan.washesInPlan);
    setFormPeriodWeeks(plan.periodWeeks != null ? String(plan.periodWeeks) : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalPlan(null);
    setFormName('');
    setFormDays([]);
    setFormTimesPerWeek(1);
    setFormLocation('INSIDE');
    setFormWashesInPlan(1);
    setFormPeriodWeeks('');
  };

  const toggleDay = (day: number) => {
    setFormDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = [...formDays].sort((a, b) => a - b);
    const periodWeeks = formPeriodWeeks.trim() ? parseInt(formPeriodWeeks, 10) : undefined;
    if (modalPlan) {
      updateMutation.mutate({
        id: modalPlan.id,
        body: {
          name: formName.trim(),
          daysOfWeek: days,
          timesPerWeek: formTimesPerWeek,
          location: formLocation,
          washesInPlan: formWashesInPlan,
          periodWeeks: periodWeeks ?? null,
        },
      });
    } else {
      createMutation.mutate({
        name: formName.trim(),
        daysOfWeek: days,
        timesPerWeek: formTimesPerWeek,
        location: formLocation,
        washesInPlan: formWashesInPlan,
        periodWeeks,
      });
    }
  };

  const handleDelete = (plan: WashPlan) => {
    if (!window.confirm(t('pages.washPlansList.confirmDeletePlan'))) return;
    deleteMutation.mutate(plan.id);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.washPlansList.title')}</h1>
        <p className="text-muted-foreground text-sm mt-2">{t('pages.washPlansList.subtitle')}</p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t('pages.washPlansList.plans')}
          </CardTitle>
          <Button size="sm" onClick={openAddModal}>
            <Plus className="size-4 mr-1" />
            {t('pages.washPlansList.addPlan')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && <ListPageSkeleton rows={5} cols={6} />}
          {!isLoading && data && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('pages.washPlansList.name')}</TableHead>
                    <TableHead>{t('pages.washPlansList.days')}</TableHead>
                    <TableHead>{t('pages.washPlansList.timesPerWeek')}</TableHead>
                    <TableHead>{t('pages.washPlansList.location')}</TableHead>
                    <TableHead>{t('pages.washPlansList.washes')}</TableHead>
                    <TableHead className="w-[120px]">{t('pages.washPlansList.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {t('pages.washPlansList.noPlans')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.items.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-sm">
                          {p.daysOfWeek.length === 0 ? '—' : p.daysOfWeek.sort((a, b) => a - b).map((d) => DAY_LABELS[d]).join(', ')}
                        </TableCell>
                        <TableCell>{p.timesPerWeek}</TableCell>
                        <TableCell>{p.location === 'INSIDE' ? t('pages.washPlansList.locationInside') : t('pages.washPlansList.locationOutside')}</TableCell>
                        <TableCell>{p.washesInPlan}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label={t('pages.washPlansList.editPlan')}
                              onClick={() => openEditModal(p)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              aria-label={t('pages.washPlansList.deletePlan')}
                              onClick={() => handleDelete(p)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                <p className="text-muted-foreground text-sm">{t('common.total')}: {data.total}</p>
                {data.total > PAGE_SIZE && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page <= 1}>
                      {t('pages.washPlansList.first')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                      {t('pages.washPlansList.previous')}
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                      {t('pages.carsList.pageOf', { current: page, total: totalPages })}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                      {t('pages.washPlansList.next')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
                      {t('pages.washPlansList.last')}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-form-title"
        >
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle id="plan-form-title" className="text-lg">
                {modalPlan ? t('pages.washPlansList.editPlan') : t('pages.washPlansList.addPlan')}
              </CardTitle>
              <Button type="button" variant="ghost" size="icon" aria-label={t('common.cancel')} onClick={closeModal}>
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-name">{t('pages.washPlansList.name')}</Label>
                  <Input
                    id="plan-name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t('pages.washPlansList.name')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('pages.washPlansList.days')}</Label>
                  <div className="flex flex-wrap gap-3">
                    {DAY_LABELS.map((label, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formDays.includes(i)}
                          onChange={() => toggleDay(i)}
                          className="rounded border-input"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-times">{t('pages.washPlansList.timesPerWeek')}</Label>
                    <Input
                      id="plan-times"
                      type="number"
                      min={1}
                      value={formTimesPerWeek}
                      onChange={(e) => setFormTimesPerWeek(parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-washes">{t('pages.washPlansList.washes')}</Label>
                    <Input
                      id="plan-washes"
                      type="number"
                      min={1}
                      value={formWashesInPlan}
                      onChange={(e) => setFormWashesInPlan(parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-location">{t('pages.washPlansList.location')}</Label>
                  <Select value={formLocation} onValueChange={setFormLocation}>
                    <SelectTrigger id="plan-location">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSIDE">{t('pages.washPlansList.locationInside')}</SelectItem>
                      <SelectItem value="OUTSIDE">{t('pages.washPlansList.locationOutside')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-period">{t('pages.washPlansList.periodWeeks')} ({t('pages.washPlansList.periodWeeksOptional')})</Label>
                  <Input
                    id="plan-period"
                    type="number"
                    min={1}
                    placeholder={t('pages.washPlansList.periodWeeksOptional')}
                    value={formPeriodWeeks}
                    onChange={(e) => setFormPeriodWeeks(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !formName.trim() ||
                      formDays.length === 0 ||
                      createMutation.isPending ||
                      updateMutation.isPending
                    }
                  >
                    {modalPlan ? t('common.save') : t('pages.washPlansList.addPlan')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
