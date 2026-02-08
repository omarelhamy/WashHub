import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author?: { id: string; name?: string; phone?: string };
}

export default function ClientCommentsPage() {
  const queryClient = useQueryClient();
  const providerId = getProviderId();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newComment, setNewComment] = useState('');

  const { data: clients } = useQuery({
    queryKey: ['clients', providerId],
    queryFn: async () => {
      const { data } = await api.get<{ items: Client[] }>(`/clients?providerId=${providerId}&limit=500`);
      return data.items ?? [];
    },
    enabled: !!providerId,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['client-comments', selectedClientId, providerId],
    queryFn: async () => {
      const { data } = await api.get<Comment[]>(
        `/client-comments?clientId=${selectedClientId}&providerId=${providerId}`
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: !!providerId && !!selectedClientId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      await api.post(
        `/client-comments?providerId=${providerId}`,
        { clientId: selectedClientId, text }
      );
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['client-comments', selectedClientId, providerId] });
    },
  });

  const selectedClient = (clients ?? []).find((c) => c.id === selectedClientId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Client Comments</h1>
      <p className="text-muted-foreground">
        Internal comments per client. Visible only to provider admins and workers (not to clients).
      </p>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Select client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— Select client —" />
              </SelectTrigger>
              <SelectContent>
                {(clients ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} – {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedClientId && (
        <p className="text-muted-foreground">Select a client to view and add comments.</p>
      )}

      {selectedClientId && selectedClient && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comments for {selectedClient.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {(comments ?? []).length === 0 ? (
                    <p className="text-muted-foreground text-sm">No comments yet.</p>
                  ) : (
                    (comments ?? []).map((c) => (
                      <div key={c.id} className="border-l-2 border-border pl-3 py-1">
                        <p className="text-sm text-muted-foreground">
                          {c.author?.name ?? c.author?.phone ?? 'Unknown'} ·{' '}
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                        <p className="whitespace-pre-wrap text-sm">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newComment">Internal note</Label>
                <Textarea
                  id="newComment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write an internal note..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <Button
                type="button"
                onClick={() => addCommentMutation.mutate(newComment)}
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? 'Adding...' : 'Add comment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
