import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';

interface WashPlan {
  id: string;
  name: string;
  daysOfWeek: number[];
  timesPerWeek: number;
  location: string;
  washesInPlan: number;
}

export default function WashPlansList() {
  const providerId = getProviderId();
  const { data, isLoading } = useQuery({
    queryKey: ['wash-plans', providerId],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: WashPlan[]; total: number }>(`/wash-plans?providerId=${providerId}&limit=50`);
      return res;
    },
    enabled: !!providerId,
  });

  if (isLoading) return <ListPageSkeleton rows={5} cols={5} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wash Plans</h1>
      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Times/Week</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Washes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.daysOfWeek.join(', ')}</TableCell>
                  <TableCell>{p.timesPerWeek}</TableCell>
                  <TableCell>{p.location}</TableCell>
                  <TableCell>{p.washesInPlan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">Total: {data?.total ?? 0}. Use Enrollment to add/remove clients from plans.</p>
    </div>
  );
}
