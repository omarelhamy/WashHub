import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Car {
  id: string;
  plateNumber: string;
  model: string | null;
  color: string | null;
  clientId: string;
  client?: { id: string; name: string };
}

export default function EditCarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const providerId = getProviderId();

  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id, providerId],
    queryFn: async () => {
      const { data } = await api.get<Car>(`/cars/${id}?providerId=${providerId}`);
      return data;
    },
    enabled: !!id && !!providerId,
  });

  useEffect(() => {
    if (car) {
      setPlateNumber(car.plateNumber);
      setModel(car.model ?? '');
      setColor(car.color ?? '');
    }
  }, [car]);

  const updateMutation = useMutation({
    mutationFn: async (body: { plateNumber: string; model?: string; color?: string }) => {
      await api.patch(`/cars/${id}?providerId=${providerId}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car', id] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success('Car updated.');
      navigate('/provider/cars');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update car');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      plateNumber: plateNumber.trim(),
      model: model.trim() || undefined,
      color: color.trim() || undefined,
    });
  };

  if (!id || !providerId) return null;
  if (isLoading || !car) return <p className="text-muted-foreground">{t('common.loading')}</p>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/provider/cars">← Back to cars</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{t('pages.carsList.editCarTitle')}</CardTitle>
          {car.client && (
            <p className="text-sm text-muted-foreground">
              Client: {car.client.name}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="plateNumber">{t('pages.carsList.plate')}</Label>
              <Input
                id="plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">{t('pages.carsList.model')}</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">{t('pages.carsList.color')}</Label>
              <Input
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {t('common.save')}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/provider/cars">{t('common.cancel')}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
