import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProvider() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('FREE_TRIAL');
  const [subscriptionStatus, setSubscriptionStatus] = useState('ACTIVE');
  const [trialEndsAt, setTrialEndsAt] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [pricePerCar, setPricePerCar] = useState('');
  const [billingCurrency, setBillingCurrency] = useState('EGP');

  const createMutation = useMutation({
    mutationFn: async () => {
      const settings: Record<string, unknown> = {};
      if (pricePerCar !== '') settings.pricePerCar = parseFloat(pricePerCar) || 0;
      settings.billingCurrency = billingCurrency || 'EGP';
      const { data } = await api.post<{ id: string }>('/providers', {
        name,
        subscriptionPlan,
        subscriptionStatus,
        trialEndsAt: trialEndsAt || undefined,
        enabled,
        settings: Object.keys(settings).length ? settings : undefined,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['super', 'stats'] });
      toast.success('Provider created');
      navigate(`/super/providers/${data.id}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create provider');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/super/providers">
          <ArrowLeft className="mr-2 size-4" /> {t('common.back')}
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">{t('pages.createProvider.title')}</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">{t('pages.providersList.newProvider')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('pages.createProvider.name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t('pages.createProvider.name')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionPlan">{t('pages.createProvider.subscriptionPlan')}</Label>
              <Input
                id="subscriptionPlan"
                value={subscriptionPlan}
                onChange={(e) => setSubscriptionPlan(e.target.value)}
                placeholder="FREE_TRIAL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionStatus">{t('pages.createProvider.subscriptionStatus')}</Label>
              <Input
                id="subscriptionStatus"
                value={subscriptionStatus}
                onChange={(e) => setSubscriptionStatus(e.target.value)}
                placeholder="ACTIVE"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trialEndsAt">{t('pages.createProvider.trialEndsAt')}</Label>
              <Input
                id="trialEndsAt"
                type="date"
                value={trialEndsAt}
                onChange={(e) => setTrialEndsAt(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="enabled">{t('pages.createProvider.enabled')}</Label>
            </div>
            <div className="border-t pt-4 space-y-2">
              <Label htmlFor="pricePerCar">{t('pages.createProvider.pricePerCar')}</Label>
              <Input
                id="pricePerCar"
                type="number"
                min={0}
                step={0.01}
                value={pricePerCar}
                onChange={(e) => setPricePerCar(e.target.value)}
                placeholder="0.00"
              />
              <Label htmlFor="billingCurrency">{t('pages.createProvider.billingCurrency')}</Label>
              <Input
                id="billingCurrency"
                value={billingCurrency}
                onChange={(e) => setBillingCurrency(e.target.value)}
                placeholder="EGP"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? '...' : t('pages.createProvider.create')}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/super/providers">{t('common.cancel')}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
