import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';

interface Payment {
  id: string;
  amount: string;
  method: string;
  status: string;
  type: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
}

export default function PaymentsList() {
  const queryClient = useQueryClient();
  const providerId = getProviderId();
  const [markPaidClientId, setMarkPaidClientId] = useState('');
  const [markPaidAmount, setMarkPaidAmount] = useState('');
  const [markPaidMethod, setMarkPaidMethod] = useState<'CASH' | 'WALLET' | 'CARD'>('CASH');

  const { data, isLoading } = useQuery({
    queryKey: ['payments', providerId],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: Payment[]; total: number }>(`/payments?providerId=${providerId}&limit=50`);
      return res;
    },
    enabled: !!providerId,
  });

  const { data: clients } = useQuery({
    queryKey: ['clients', providerId],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: Client[] }>(`/clients?providerId=${providerId}&limit=500`);
      return res.items ?? [];
    },
    enabled: !!providerId,
  });

  const markPaidMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      await api.post(`/payments?providerId=${providerId}`, {
        providerId,
        clientId: markPaidClientId,
        amount: Number(markPaidAmount),
        method: markPaidMethod,
        status: 'PAID',
        type: 'MONTHLY_RENEWAL',
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
      });
    },
    onSuccess: () => {
      const clientIdForJobs = markPaidClientId;
      const monthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      setMarkPaidClientId('');
      setMarkPaidAmount('');
      queryClient.invalidateQueries({ queryKey: ['payments', providerId] });
      if (clientIdForJobs && providerId) {
        api
          .post(`/wash-jobs/generate-month?providerId=${providerId}&month=${monthStr}&clientId=${clientIdForJobs}`)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['wash-jobs'] });
            queryClient.invalidateQueries({ queryKey: ['wash-jobs-calendar'] });
          })
          .catch(() => {});
      }
    },
  });

  if (isLoading) return <ListPageSkeleton rows={5} cols={5} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Mark client paid (monthly renewal)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={markPaidClientId} onValueChange={setMarkPaidClientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— Select client —" />
              </SelectTrigger>
              <SelectContent>
                {(clients ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} – {c.phone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={0}
              value={markPaidAmount}
              onChange={(e) => setMarkPaidAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={markPaidMethod} onValueChange={(v) => setMarkPaidMethod(v as 'CASH' | 'WALLET' | 'CARD')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="WALLET">Wallet</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={() => markPaidMutation.mutate()}
            disabled={!markPaidClientId || !markPaidAmount || markPaidMutation.isPending}
          >
            {markPaidMutation.isPending ? 'Saving...' : 'Mark paid'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.amount}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-sm">Total: {data?.total ?? 0}.</p>
    </div>
  );
}
