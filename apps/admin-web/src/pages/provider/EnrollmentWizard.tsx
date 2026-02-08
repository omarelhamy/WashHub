import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WashPlan {
  id: string;
  name: string;
  daysOfWeek: number[];
  timesPerWeek: number;
  location: string;
  washesInPlan: number;
}

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface Enrollment {
  id: string;
  clientId: string;
  client?: Client;
}

export default function EnrollmentWizard() {
  const queryClient = useQueryClient();
  const providerId = getProviderId();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const { data: plansResponse } = useQuery({
    queryKey: ['wash-plans', providerId],
    queryFn: async () => {
      const { data } = await api.get<{ items?: WashPlan[] }>(`/wash-plans?providerId=${providerId}&limit=100`);
      const items = data?.items;
      return Array.isArray(items) ? items : [];
    },
    enabled: !!providerId,
  });
  const plans = Array.isArray(plansResponse) ? plansResponse : [];

  const { data: clientsResponse } = useQuery({
    queryKey: ['clients', providerId],
    queryFn: async () => {
      const { data } = await api.get<{ items?: Client[] }>(`/clients?providerId=${providerId}&limit=500`);
      const items = data?.items;
      return Array.isArray(items) ? items : [];
    },
    enabled: !!providerId,
  });
  const clients = Array.isArray(clientsResponse) ? clientsResponse : [];

  const { data: enrolled, isLoading: enrolledLoading } = useQuery({
    queryKey: ['wash-plans-enrolled', selectedPlanId, providerId],
    queryFn: async () => {
      const { data } = await api.get<Enrollment[]>(`/wash-plans/${selectedPlanId}/enrolled?providerId=${providerId}`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!providerId && !!selectedPlanId,
  });

  const enrollMutation = useMutation({
    mutationFn: async (clientId: string) => {
      await api.post(`/wash-plans/${selectedPlanId}/enroll/${clientId}?providerId=${providerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-plans-enrolled', selectedPlanId, providerId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (clientId: string) => {
      await api.delete(`/wash-plans/${selectedPlanId}/enroll/${clientId}?providerId=${providerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-plans-enrolled', selectedPlanId, providerId] });
    },
  });

  const enrolledClientIds = new Set((enrolled ?? []).map((e) => e.clientId || (e.client?.id ?? e.id)));
  const notInPlan = clients.filter((c) => !enrolledClientIds.has(c.id));
  const inPlan = (enrolled ?? [])
    .map((e) => e.client ?? { id: e.clientId, name: '—', phone: '—' })
    .filter((c) => c.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plan Enrollment Wizard</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Step 1: Select a wash plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— Select plan —" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.timesPerWeek}x/week, {p.location})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedPlanId && (
        <p className="text-muted-foreground">Select a plan to see clients in this plan and add/remove enrollments.</p>
      )}

      {selectedPlanId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">In this plan</CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {inPlan.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No clients enrolled yet.</p>
                  ) : (
                    inPlan.map((c) => (
                      <div key={c.id} className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-sm">{c.name} – {c.phone}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMutation.mutate(c.id)}
                          disabled={removeMutation.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Not in this plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notInPlan.length === 0 ? (
                  <p className="text-muted-foreground text-sm">All clients are in this plan or no clients.</p>
                ) : (
                  notInPlan.map((c) => (
                    <div key={c.id} className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-sm">{c.name} – {c.phone}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => enrollMutation.mutate(c.id)}
                        disabled={enrollMutation.isPending}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
