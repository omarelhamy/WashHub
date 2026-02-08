import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';

interface WashJob {
  id: string;
  status: string;
  scheduledAt: string;
  clientId: string;
  carId: string;
}

export default function WashJobsList() {
  const providerId = getProviderId();
  const { data, isLoading } = useQuery({
    queryKey: ['wash-jobs', providerId],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: WashJob[]; total: number }>(`/wash-jobs?providerId=${providerId}&limit=50`);
      return res;
    },
    enabled: !!providerId,
  });

  if (isLoading) return <ListPageSkeleton rows={5} cols={3} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wash Jobs</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Client ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((j) => (
                <TableRow key={j.id}>
                  <TableCell>{new Date(j.scheduledAt).toLocaleString()}</TableCell>
                  <TableCell>{j.status}</TableCell>
                  <TableCell>{j.clientId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">Total: {data?.total ?? 0}</p>
    </div>
  );
}
