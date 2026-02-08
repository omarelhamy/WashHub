import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WashJob {
  id: string;
  status: string;
  scheduledAt: string;
  clientId: string;
  carId: string;
}

export default function WorkerDashboard() {
  const queryClient = useQueryClient();
  const providerId = getProviderId();
  const today = new Date().toISOString().slice(0, 10);
  const { data, isLoading } = useQuery({
    queryKey: ['worker-jobs', providerId, today],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: WashJob[]; total: number }>(
        `/wash-jobs?providerId=${providerId}&date=${today}&limit=50`
      );
      return res;
    },
    enabled: !!providerId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      await api.patch(`/wash-jobs/${jobId}?providerId=${providerId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-jobs', providerId, today] });
    },
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Worker – Today&apos;s Tasks</h1>
      <p className="text-muted-foreground">Date: {today}</p>
      <div className="space-y-4">
        {(data?.items ?? []).map((j) => (
          <Card key={j.id}>
            <CardContent className="flex justify-between items-center py-4">
              <div>
                <p className="font-medium">Job {j.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">{new Date(j.scheduledAt).toLocaleTimeString()} – {j.status}</p>
              </div>
              <div className="flex gap-2">
                {j.status === 'NOT_STARTED' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ jobId: j.id, status: 'IN_PROGRESS' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    Start
                  </Button>
                )}
                {j.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateStatusMutation.mutate({ jobId: j.id, status: 'COMPLETED' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!data?.items?.length) && <p className="text-muted-foreground">No jobs for today.</p>}
    </div>
  );
}
