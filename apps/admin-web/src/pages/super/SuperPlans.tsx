import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WashPlan {
  id: string;
  name: string;
  daysOfWeek: number[];
  timesPerWeek: number;
  location: string;
  washesInPlan: number;
  periodWeeks: number | null;
}

export default function SuperPlans() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<WashPlan | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTimesPerWeek, setFormTimesPerWeek] = useState(2);
  const [formWashesInPlan, setFormWashesInPlan] = useState(4);
  const [formLocation, setFormLocation] = useState<'INSIDE' | 'OUTSIDE'>('OUTSIDE');

  const { data: provider } = useQuery({
    queryKey: ['provider', id],
    queryFn: async () => {
      const { data } = await api.get<{ name: string }>(`/providers/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['wash-plans', id],
    queryFn: async () => {
      const { data } = await api.get<{ items: WashPlan[]; total: number }>(`/wash-plans?providerId=${id}&limit=100`);
      return data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      await api.delete(`/wash-plans/${planId}?providerId=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-plans', id] });
      toast.success('Plan deleted');
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message ?? 'Failed to delete');
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<WashPlan>('/wash-plans', {
        providerId: id,
        name: formName,
        daysOfWeek: [1, 2, 3, 4, 5],
        timesPerWeek: formTimesPerWeek,
        location: formLocation,
        washesInPlan: formWashesInPlan,
      }, { params: { providerId: id } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-plans', id] });
      setCreateOpen(false);
      setFormName('');
      toast.success('Plan created');
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message ?? 'Failed to create');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await api.patch<WashPlan>(`/wash-plans/${planId}?providerId=${id}`, {
        name: formName,
        timesPerWeek: formTimesPerWeek,
        washesInPlan: formWashesInPlan,
        location: formLocation,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-plans', id] });
      setEditingPlan(null);
      toast.success('Plan updated');
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e?.response?.data?.message ?? 'Failed to update');
    },
  });

  if (isLoading || !id) return <ListPageSkeleton rows={5} cols={5} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/super/providers/${id}`}>
            <ArrowLeft className="mr-2 size-4" /> {t('common.back')}
          </Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold">
        {t('pages.superPlans.title')} – {provider?.name ?? id}
      </h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t('pages.superPlans.title')}</CardTitle>
          <Button size="sm" onClick={() => { setFormName(''); setCreateOpen(true); }}>
            <Plus className="mr-2 size-4" /> {t('pages.superPlans.createPlan')}
          </Button>
        </CardHeader>
        <CardContent>
          {(plans?.items ?? []).length === 0 ? (
            <p className="text-muted-foreground">{t('pages.superPlans.noPlans')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pages.washPlansList.name')}</TableHead>
                  <TableHead>{t('pages.washPlansList.timesPerWeek')}</TableHead>
                  <TableHead>{t('pages.washPlansList.washes')}</TableHead>
                  <TableHead>{t('pages.washPlansList.location')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(plans?.items ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.timesPerWeek}</TableCell>
                    <TableCell>{p.washesInPlan}</TableCell>
                    <TableCell>{p.location}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPlan(p);
                          setFormName(p.name);
                          setFormTimesPerWeek(p.timesPerWeek);
                          setFormWashesInPlan(p.washesInPlan);
                          setFormLocation(p.location as 'INSIDE' | 'OUTSIDE');
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Delete this plan?')) deleteMutation.mutate(p.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('pages.superPlans.createPlan')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('pages.washPlansList.name')}</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Plan name" />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.washPlansList.timesPerWeek')}</Label>
              <Input type="number" min={1} value={formTimesPerWeek} onChange={(e) => setFormTimesPerWeek(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.washPlansList.washes')}</Label>
              <Input type="number" min={1} value={formWashesInPlan} onChange={(e) => setFormWashesInPlan(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.washPlansList.location')}</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value as 'INSIDE' | 'OUTSIDE')}
              >
                <option value="INSIDE">INSIDE</option>
                <option value="OUTSIDE">OUTSIDE</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !formName.trim()}>
                {createMutation.isPending ? '...' : t('common.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {editingPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('pages.superPlans.editPlan')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('pages.washPlansList.name')}</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.washPlansList.timesPerWeek')}</Label>
              <Input type="number" min={1} value={formTimesPerWeek} onChange={(e) => setFormTimesPerWeek(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.washPlansList.washes')}</Label>
              <Input type="number" min={1} value={formWashesInPlan} onChange={(e) => setFormWashesInPlan(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.washPlansList.location')}</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value as 'INSIDE' | 'OUTSIDE')}
              >
                <option value="INSIDE">INSIDE</option>
                <option value="OUTSIDE">OUTSIDE</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingPlan(null)}>{t('common.cancel')}</Button>
              <Button onClick={() => updateMutation.mutate(editingPlan.id)} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? '...' : t('common.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
