import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WashJobComment {
  id: string;
  text: string;
  createdAt: string;
}

interface WashJob {
  id: string;
  status: string;
  scheduledAt: string;
  clientId: string;
  carId: string;
  client?: { id: string; name: string };
  car?: { id: string; plateNumber: string };
  comments?: WashJobComment[];
}

export default function WorkerDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const providerId = getProviderId();
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
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
      <p className="text-muted-foreground">Showing today&apos;s wash jobs only. Date: {today}</p>
      <div className="space-y-4">
        {(data?.items ?? []).map((j) => (
          <Card key={j.id}>
            <CardContent className="py-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-medium">{j.client?.name ?? j.clientId} – {j.car?.plateNumber ?? j.carId}</p>
                  <p className="text-sm text-muted-foreground">{new Date(j.scheduledAt).toLocaleTimeString()} – {j.status}</p>
                </div>
                <div className="flex gap-2 shrink-0">
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
              </div>
              {(j.comments?.length ?? 0) > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('pages.worker.comments')}:</p>
                  <ul className="text-sm space-y-1">
                    {[...(j.comments ?? [])]
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((c) => (
                      <li key={c.id} className="bg-muted/50 rounded px-2 py-1">{c.text}</li>
                      ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {(!data?.items?.length) && <p className="text-muted-foreground">No jobs for today.</p>}
    </div>
  );
}
