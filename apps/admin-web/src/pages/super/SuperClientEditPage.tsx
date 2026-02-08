import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  phone: string;
  providerId: string;
  enrollmentCode: string | null;
}

export default function SuperClientEditPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('providerId') ?? '';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id, providerId],
    queryFn: async () => {
      const { data } = await api.get<Client>(`/clients/${id}?providerId=${providerId}`);
      return data;
    },
    enabled: !!id && !!providerId,
  });

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone);
    }
  }, [client]);

  const updateMutation = useMutation({
    mutationFn: async (body: { name: string; phone: string }) => {
      await api.patch(`/clients/${id}?providerId=${providerId}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id, providerId] });
      queryClient.invalidateQueries({ queryKey: ['super-clients'] });
      toast.success(t('pages.superClientDetail.updateSuccess'));
      navigate(`/super/clients/${id}?providerId=${providerId}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update client');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name, phone });
  };

  if (!providerId || !id) return <Navigate to="/super/clients" replace />;
  if (isLoading || !client) return <p className="text-muted-foreground">{t('common.loading')}</p>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/super/clients/${id}?providerId=${providerId}`}>← {t('pages.superClientDetail.backToClient')}</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t('pages.superClientDetail.editClient')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name">{t('pages.superClientsList.name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('pages.superClientsList.phone')}</Label>
              <Input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {t('common.save')}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to={`/super/clients/${id}?providerId=${providerId}`}>{t('common.cancel')}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
