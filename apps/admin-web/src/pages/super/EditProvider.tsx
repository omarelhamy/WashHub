import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface Provider {
  id: string;
  name: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  enabled: boolean;
  settings: Record<string, unknown> | null;
  trialEndsAt: string | null;
}

export default function EditProvider() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [pricePerCar, setPricePerCar] = useState('');
  const [billingCurrency, setBillingCurrency] = useState('EGP');

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: async () => {
      const { data } = await api.get<Provider>(`/providers/${id}`);
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (provider) {
      setName(provider.name);
      setSubscriptionPlan(provider.subscriptionPlan);
      setSubscriptionStatus(provider.subscriptionStatus);
      setTrialEndsAt(provider.trialEndsAt ? provider.trialEndsAt.slice(0, 10) : '');
      setEnabled(provider.enabled);
      const s = (provider.settings ?? {}) as Record<string, unknown>;
      setPricePerCar(s.pricePerCar != null ? String(s.pricePerCar) : '');
      setBillingCurrency((s.billingCurrency as string) || 'EGP');
    }
  }, [provider]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const settings: Record<string, unknown> = { ...((provider?.settings as Record<string, unknown>) ?? {}) };
      if (pricePerCar !== '') settings.pricePerCar = parseFloat(pricePerCar) || 0;
      else delete settings.pricePerCar;
      settings.billingCurrency = billingCurrency || 'EGP';
      const { data } = await api.patch<Provider>(`/providers/${id}`, {
        name,
        subscriptionPlan,
        subscriptionStatus,
        trialEndsAt: trialEndsAt || null,
        enabled,
        settings: Object.keys(settings).length ? settings : null,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', id] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['super-provider-detail', id] });
      toast.success('Provider updated');
      navigate(`/super/providers/${id}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (isLoading || !provider) return null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/super/providers/${id}`}>
          <ArrowLeft className="mr-2 size-4" /> {t('common.back')}
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">{t('pages.superProviderDetail.editProvider')}</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">{provider.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('pages.createProvider.name')}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionPlan">{t('pages.createProvider.subscriptionPlan')}</Label>
              <Input id="subscriptionPlan" value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionStatus">{t('pages.createProvider.subscriptionStatus')}</Label>
              <Input id="subscriptionStatus" value={subscriptionStatus} onChange={(e) => setSubscriptionStatus(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trialEndsAt">{t('pages.createProvider.trialEndsAt')}</Label>
              <Input id="trialEndsAt" type="date" value={trialEndsAt} onChange={(e) => setTrialEndsAt(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="enabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded border-input" />
              <Label htmlFor="enabled">{t('pages.createProvider.enabled')}</Label>
            </div>
            <div className="border-t pt-4 space-y-4">
              <CardTitle className="text-sm">{t('pages.editProvider.billingTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('pages.editProvider.billingDesc')}</p>
              <div className="space-y-2">
                <Label htmlFor="pricePerCar">{t('pages.editProvider.pricePerCar')}</Label>
                <Input
                  id="pricePerCar"
                  type="number"
                  min={0}
                  step={0.01}
                  value={pricePerCar}
                  onChange={(e) => setPricePerCar(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCurrency">{t('pages.editProvider.billingCurrency')}</Label>
                <Input
                  id="billingCurrency"
                  value={billingCurrency}
                  onChange={(e) => setBillingCurrency(e.target.value)}
                  placeholder="EGP"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? '...' : t('common.save')}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={`/super/providers/${id}`}>{t('common.cancel')}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
