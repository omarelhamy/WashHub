import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/ListPageSkeleton';

export default function ProviderDashboard() {
  const providerId = getProviderId();
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients', providerId],
    queryFn: async () => {
      const { data } = await api.get<{ items: unknown[]; total: number }>(`/clients?providerId=${providerId}&limit=10`);
      return data;
    },
    enabled: !!providerId,
  });
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['wash-jobs', providerId],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await api.get<{ items: unknown[]; total: number }>(`/wash-jobs?providerId=${providerId}&date=${today}&limit=10`);
      return data;
    },
    enabled: !!providerId,
  });

  if (clientsLoading || jobsLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Provider Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{clients?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{jobs?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-muted-foreground">Use the navigation to manage clients, cars, wash jobs, plans, and payments.</p>
    </div>
  );
}
