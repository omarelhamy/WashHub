import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle2, User, MapPin, Car, Package } from 'lucide-react';

type EnrollPlan = { id: string; name: string; timesPerWeek: number; location: string; washesInPlan: number };

type CarEntry = { plateNumber: string; model: string; color: string };

const emptyCar = (): CarEntry => ({ plateNumber: '', model: '', color: '' });

export default function PublicEnrollPage() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code') ?? '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('__none__');
  const [cars, setCars] = useState<CarEntry[]>([emptyCar()]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: enrollInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ['public-enroll-info', codeFromUrl],
    queryFn: async () => {
      const { data } = await api.get<{ provider: { id: string; name: string }; plans: EnrollPlan[] }>(
        `/public/enroll-info?code=${encodeURIComponent(codeFromUrl)}`
      );
      return data;
    },
    enabled: codeFromUrl.length > 0,
  });
  const providerName = enrollInfo?.provider?.name ?? 'Car Wash Service';
  const plans = enrollInfo?.plans ?? [];

  const addCar = () => setCars((prev) => [...prev, emptyCar()]);
  const removeCar = (index: number) => {
    if (cars.length <= 1) return;
    setCars((prev) => prev.filter((_, i) => i !== index));
  };
  const updateCar = (index: number, field: keyof CarEntry, value: string) => {
    setCars((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const carsPayload = cars
        .filter((c) => c.plateNumber.trim())
        .map((c) => ({
          plateNumber: c.plateNumber.trim(),
          ...(c.model.trim() && { model: c.model.trim() }),
          ...(c.color.trim() && { color: c.color.trim() }),
        }));
      await api.post('/public/enroll', {
        code: codeFromUrl,
        name: name.trim(),
        phone: phone.trim(),
        ...(address.trim() && { address: address.trim() }),
        ...(carsPayload.length > 0 && { cars: carsPayload }),
        ...(selectedPlanId && selectedPlanId !== '__none__' && { planIds: [selectedPlanId] }),
      });
      setSuccess(true);
      toast.success('Enrollment successful');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Enrollment failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="pt-10 pb-10 px-6 sm:px-8 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="size-9" aria-hidden />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">You’re all set</h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
              Thanks for registering with <span className="font-medium text-foreground">{providerName}</span>. Your details have been saved and we’ll be in touch soon.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header – provider branding */}
        <header className="text-center pt-4 sm:pt-6 pb-2">
          {loadingInfo ? (
            <div className="h-10 bg-muted/50 rounded-lg animate-pulse max-w-xs mx-auto" />
          ) : (
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {providerName}
            </h1>
          )}
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Quick registration — we’ll take it from here
          </p>
        </header>

        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-5 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Your details */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="size-4 text-primary shrink-0" aria-hidden />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your details</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name" className="text-foreground">Full name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ahmed Ali"
                      required
                      disabled={loading}
                      className="h-11 bg-background/50 border-border/80 focus-visible:ring-2"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone" className="text-foreground">Phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 05xxxxxxxx"
                      required
                      disabled={loading}
                      className="h-11 bg-background/50 border-border/80 focus-visible:ring-2"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address" className="text-foreground">Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, city or area"
                        disabled={loading}
                        className="h-11 pl-9 bg-background/50 border-border/80 focus-visible:ring-2"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Plan */}
              {plans.length > 0 && (
                <section className="space-y-4 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2 text-foreground pt-2">
                    <Package className="size-4 text-primary shrink-0" aria-hidden />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Wash plan</h2>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground sr-only">Choose a plan (optional)</Label>
                    <Select value={selectedPlanId} onValueChange={setSelectedPlanId} disabled={loading}>
                      <SelectTrigger className="h-11 bg-background/50 border-border/80 focus:ring-2">
                        <SelectValue placeholder="Select a plan (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No plan for now</SelectItem>
                        {plans.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — {p.timesPerWeek}×/week, {p.washesInPlan} washes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </section>
              )}

              {/* Cars */}
              <section className="space-y-4 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-foreground">
                    <Car className="size-4 text-primary shrink-0" aria-hidden />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your cars</h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCar}
                    disabled={loading}
                    className="gap-1.5 h-9 text-xs font-medium"
                  >
                    <Plus className="size-3.5" aria-hidden /> Add car
                  </Button>
                </div>
                <div className="space-y-4">
                  {cars.map((car, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Car {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeCar(index)}
                          disabled={loading || cars.length <= 1}
                          title="Remove car"
                          aria-label="Remove car"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`plate-${index}`} className="text-xs text-muted-foreground">Plate</Label>
                          <Input
                            id={`plate-${index}`}
                            value={car.plateNumber}
                            onChange={(e) => updateCar(index, 'plateNumber', e.target.value)}
                            placeholder="ABC 1234"
                            disabled={loading}
                            className="h-10 bg-background/50 border-border/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`model-${index}`} className="text-xs text-muted-foreground">Model</Label>
                          <Input
                            id={`model-${index}`}
                            value={car.model}
                            onChange={(e) => updateCar(index, 'model', e.target.value)}
                            placeholder="e.g. Toyota Camry"
                            disabled={loading}
                            className="h-10 bg-background/50 border-border/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`color-${index}`} className="text-xs text-muted-foreground">Color</Label>
                          <Input
                            id={`color-${index}`}
                            value={car.color}
                            onChange={(e) => updateCar(index, 'color', e.target.value)}
                            placeholder="e.g. White"
                            disabled={loading}
                            className="h-10 bg-background/50 border-border/80"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? 'Submitting…' : 'Complete registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pb-4">
          By registering you agree to be contacted by {providerName}.
        </p>
      </div>
    </div>
  );
}
