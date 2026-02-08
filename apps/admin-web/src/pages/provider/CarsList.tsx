import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';

interface Car {
  id: string;
  plateNumber: string;
  model: string | null;
  color: string | null;
  clientId: string;
}

export default function CarsList() {
  const providerId = getProviderId();
  const location = useLocation();
  const stateClientId = (location.state as { clientId?: string } | null)?.clientId;
  const [clientId, setClientId] = useState(stateClientId ?? '');
  useEffect(() => {
    if (stateClientId) setClientId(stateClientId);
  }, [stateClientId]);
  const { data, isLoading } = useQuery({
    queryKey: ['cars', providerId, clientId],
    queryFn: async () => {
      const { data: res } = await api.get<Car[]>(`/cars?providerId=${providerId}&clientId=${clientId}`);
      return Array.isArray(res) ? res : [];
    },
    enabled: !!providerId && !!clientId,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cars</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Filter by client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter client ID to list their cars"
            />
          </div>
        </CardContent>
      </Card>
      {isLoading && <ListPageSkeleton rows={3} cols={3} />}
      {clientId && data !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cars</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Color</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.plateNumber}</TableCell>
                    <TableCell>{c.model ?? '—'}</TableCell>
                    <TableCell>{c.color ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
