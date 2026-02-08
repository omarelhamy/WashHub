import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getProviderId } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientSelect } from '@/components/ClientSelect';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';
import { toast } from 'sonner';
import { ArrowUpDown, ArrowUp, ArrowDown, MessageSquare, Pencil, Trash2, X, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';

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

interface CarOption {
  id: string;
  plateNumber: string;
  clientId: string;
}

const PAGE_SIZE = 20;
const CALENDAR_LIMIT = 500;
type SortBy = 'scheduledAt' | 'status' | 'clientName' | 'carPlate';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'table' | 'calendar';

function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonthRange(ym: string): { dateFrom: string; dateTo: string } {
  const [y, m] = ym.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    dateFrom: `${ym}-01`,
    dateTo: `${ym}-${String(lastDay).padStart(2, '0')}`,
  };
}

function getCalendarWeeks(ym: string): (number | null)[][] {
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const remainder = cells.length % 7;
  if (remainder) for (let i = 0; i < 7 - remainder; i++) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function WashJobsList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const providerId = getProviderId();
  const today = getLocalDateString();

  const [dateFilter, setDateFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('scheduledAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addClientId, setAddClientId] = useState('');
  const [addCarId, setAddCarId] = useState('');
  const [addDate, setAddDate] = useState(today);
  const [addTime, setAddTime] = useState('08:00');
  const [generationReport, setGenerationReport] = useState<{ created: number; skipped: number } | null>(null);
  const [generateMonthValue, setGenerateMonthValue] = useState<string>(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  });
  const [generationMonthReport, setGenerationMonthReport] = useState<{ created: number; skipped: number } | null>(null);
  const [commentJobId, setCommentJobId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [calendarMonth, setCalendarMonth] = useState<string>(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  });

  const { data, isLoading } = useQuery({
    queryKey: ['wash-jobs', providerId, dateFilter || 'all', page, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        providerId: providerId!,
        page: String(page),
        limit: String(PAGE_SIZE),
        sortBy,
        sortOrder,
      });
      if (dateFilter) params.set('date', dateFilter);
      const { data: res } = await api.get<{ items: WashJob[]; total: number; page: number; limit: number }>(`/wash-jobs?${params}`);
      return res;
    },
    enabled: !!providerId && viewMode === 'table',
  });

  const { dateFrom: calFrom, dateTo: calTo } = getMonthRange(calendarMonth);
  const { data: calendarData, isLoading: calendarLoading } = useQuery({
    queryKey: ['wash-jobs-calendar', providerId, calFrom, calTo],
    queryFn: async () => {
      const params = new URLSearchParams({
        providerId: providerId!,
        limit: String(CALENDAR_LIMIT),
        sortBy: 'scheduledAt',
        sortOrder: 'asc',
        dateFrom: calFrom,
        dateTo: calTo,
      });
      const { data: res } = await api.get<{ items: WashJob[] }>(`/wash-jobs?${params}`);
      return res;
    },
    enabled: !!providerId && viewMode === 'calendar',
  });

  const jobsByDay = (() => {
    if (viewMode !== 'calendar' || !calendarData?.items) return new Map<string, WashJob[]>();
    const map = new Map<string, WashJob[]>();
    for (const j of calendarData.items) {
      const d = getLocalDateString(new Date(j.scheduledAt));
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(j);
    }
    return map;
  })();

  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'scheduledAt' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const { data: carsData } = useQuery({
    queryKey: ['cars-by-client', providerId, addClientId],
    queryFn: async () => {
      const { data } = await api.get<{ items: CarOption[] }>(`/cars?providerId=${providerId}&clientId=${addClientId}&limit=50`);
      return data;
    },
    enabled: !!providerId && !!addClientId && showAddForm,
  });
  const cars = carsData?.items ?? [];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const dateParam = getLocalDateString();
      const { data: res } = await api.post<{ created: number; skipped: number }>(`/wash-jobs/generate-today?date=${dateParam}`);
      return res;
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['wash-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['wash-jobs-calendar'] });
      setGenerationReport(report);
      setDateFilter(today);
      if (report.created > 0) toast.success(t('pages.washJobsList.generateSuccess'));
    },
    onError: () => toast.error('Failed to generate jobs'),
  });

  const generateMonthMutation = useMutation({
    mutationFn: async () => {
      const { data: res } = await api.post<{ created: number; skipped: number }>(
        `/wash-jobs/generate-month?providerId=${providerId}&month=${generateMonthValue}`
      );
      return res;
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['wash-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['wash-jobs-calendar'] });
      setGenerationMonthReport(report);
      if (report.created > 0) toast.success(t('pages.washJobsList.generateMonthSuccess'));
    },
    onError: () => toast.error('Failed to generate month jobs'),
  });

  const createMutation = useMutation({
    mutationFn: async (body: { clientId: string; carId: string; scheduledAt: string }) => {
      await api.post(`/wash-jobs?providerId=${providerId}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['wash-jobs-calendar'] });
      toast.success(t('pages.washJobsList.addSuccess'));
      setShowAddForm(false);
      setAddClientId('');
      setAddCarId('');
      setAddDate(today);
      setAddTime('08:00');
    },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e?.response?.data?.message ?? 'Failed to add job'),
  });

  const commentsQueryKey = ['wash-job-comments', commentJobId, providerId] as const;
  const { data: commentsList = [], isLoading: commentsLoading } = useQuery({
    queryKey: commentsQueryKey,
    queryFn: async () => {
      const { data } = await api.get<WashJobComment[]>(`/wash-jobs/${commentJobId}/comments?providerId=${providerId}`);
      return data;
    },
    enabled: !!commentJobId && !!providerId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ jobId, text }: { jobId: string; text: string }) => {
      await api.post(`/wash-jobs/${jobId}/comments?providerId=${providerId}`, { text });
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['wash-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['wash-jobs-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['wash-job-comments', jobId, providerId] });
      setCommentText('');
      toast.success(t('pages.washJobsList.commentAdded'));
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ jobId, commentId, text }: { jobId: string; commentId: string; text: string }) => {
      await api.patch(`/wash-jobs/${jobId}/comments/${commentId}?providerId=${providerId}`, { text });
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['wash-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['wash-jobs-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['wash-job-comments', jobId, providerId] });
      setEditingCommentId(null);
      setEditingText('');
      toast.success(t('pages.washJobsList.commentUpdated'));
    },
    onError: () => toast.error('Failed to update comment'),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async ({ jobId, commentId }: { jobId: string; commentId: string }) => {
      await api.delete(`/wash-jobs/${jobId}/comments/${commentId}?providerId=${providerId}`);
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['wash-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['wash-jobs-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['wash-job-comments', jobId, providerId] });
      toast.success(t('pages.washJobsList.commentDeleted'));
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  const openCommentsModal = (jobId: string) => {
    setCommentJobId(jobId);
    setCommentText('');
    setEditingCommentId(null);
    setEditingText('');
  };

  const closeCommentsModal = () => {
    setCommentJobId(null);
    setCommentText('');
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledAt = `${addDate}T${addTime}:00.000Z`;
    createMutation.mutate({ clientId: addClientId, carId: addCarId, scheduledAt });
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.washJobsList.title')}</h1>
        <p className="text-muted-foreground text-sm mt-2">{t('pages.washJobsList.filterByDate')}</p>
      </header>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t('pages.washJobsList.filterByDate')}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-input bg-muted/30 p-0.5" role="group" aria-label={t('pages.washJobsList.filterByDate')}>
              <Button
                type="button"
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-1.5 rounded"
                onClick={() => setViewMode('table')}
              >
                <LayoutGrid className="size-3.5" />
                {t('pages.washJobsList.tableView')}
              </Button>
              <Button
                type="button"
                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-1.5 rounded"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="size-3.5" />
                {t('pages.washJobsList.calendarView')}
              </Button>
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="w-[160px]"
            />
            <Button variant="outline" size="sm" onClick={() => { setDateFilter(''); setPage(1); }}>
              {t('pages.washJobsList.allDates')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setDateFilter(today); setPage(1); }}>
              {t('pages.washJobsList.today')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {t('pages.washJobsList.generateTodaysJobs')}
            </Button>
            <Input
              type="month"
              value={generateMonthValue}
              onChange={(e) => setGenerateMonthValue(e.target.value)}
              className="w-[140px]"
              title={t('pages.washJobsList.generateMonthJobs')}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMonthMutation.mutate()}
              disabled={generateMonthMutation.isPending}
            >
              {t('pages.washJobsList.generateMonthJobs')}
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              {t('pages.washJobsList.addWashJob')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {generationReport !== null && (
            <div
              className="mb-4 rounded-lg border bg-muted/50 px-4 py-3 text-sm flex items-center justify-between gap-4"
              role="alert"
            >
              <span>
                {generationReport.created > 0
                  ? t('pages.washJobsList.generationReport', {
                      created: generationReport.created,
                      skipped: generationReport.skipped,
                    })
                  : generationReport.skipped > 0
                    ? t('pages.washJobsList.generationReportOnlySkipped', { skipped: generationReport.skipped })
                    : t('pages.washJobsList.generationReportNone')}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setGenerationReport(null)}>
                {t('pages.washJobsList.dismiss')}
              </Button>
            </div>
          )}
          {generationMonthReport !== null && (
            <div
              className="mb-4 rounded-lg border bg-muted/50 px-4 py-3 text-sm flex items-center justify-between gap-4"
              role="alert"
            >
              <span>
                {generationMonthReport.created > 0
                  ? t('pages.washJobsList.generationMonthReport', {
                      created: generationMonthReport.created,
                      skipped: generationMonthReport.skipped,
                    })
                  : t('pages.washJobsList.generationMonthReportNone')}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setGenerationMonthReport(null)}>
                {t('pages.washJobsList.dismiss')}
              </Button>
            </div>
          )}
          {showAddForm && (
            <Card className="mb-6 border-dashed">
              <CardHeader>
                <CardTitle className="text-base">{t('pages.washJobsList.addWashJob')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSubmit} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label>{t('pages.washJobsList.client')}</Label>
                    <ClientSelect
                      providerId={providerId ?? undefined}
                      value={addClientId}
                      onChange={(id) => { setAddClientId(id); setAddCarId(''); }}
                      allowAll={false}
                      placeholder={t('components.clientSelect.selectClient')}
                      searchPlaceholder={t('components.clientSelect.searchPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('pages.washJobsList.car')}</Label>
                    <Select value={addCarId} onValueChange={setAddCarId} disabled={!addClientId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select car" />
                      </SelectTrigger>
                      <SelectContent>
                        {(cars ?? []).map((car) => (
                          <SelectItem key={car.id} value={car.id}>{car.plateNumber}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                      <Label>{t('pages.washJobsList.scheduledAt')}</Label>
                      <Input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} required />
                    </div>
                    <div className="space-y-2 w-32">
                      <Label>&nbsp;</Label>
                      <Input type="time" value={addTime} onChange={(e) => setAddTime(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createMutation.isPending || !addClientId || !addCarId}>
                      {t('common.add')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {viewMode === 'table' && isLoading && <ListPageSkeleton rows={5} cols={4} />}
          {viewMode === 'table' && !isLoading && data && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => handleSort('scheduledAt')}
                        className="flex items-center gap-1 font-medium hover:underline focus:outline-none focus:underline"
                      >
                        {t('pages.washJobsList.scheduled')}
                        {sortBy === 'scheduledAt' ? sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" /> : <ArrowUpDown className="size-4 opacity-50" />}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 font-medium hover:underline focus:outline-none focus:underline"
                      >
                        {t('pages.washJobsList.status')}
                        {sortBy === 'status' ? sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" /> : <ArrowUpDown className="size-4 opacity-50" />}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => handleSort('clientName')}
                        className="flex items-center gap-1 font-medium hover:underline focus:outline-none focus:underline"
                      >
                        {t('pages.washJobsList.client')}
                        {sortBy === 'clientName' ? sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" /> : <ArrowUpDown className="size-4 opacity-50" />}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => handleSort('carPlate')}
                        className="flex items-center gap-1 font-medium hover:underline focus:outline-none focus:underline"
                      >
                        {t('pages.washJobsList.car')}
                        {sortBy === 'carPlate' ? sortOrder === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" /> : <ArrowUpDown className="size-4 opacity-50" />}
                      </button>
                    </TableHead>
                    <TableHead className="w-[180px]">{t('pages.washJobsList.comments')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {dateFilter ? t('pages.washJobsList.noJobsForDate') : t('common.noResults')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.items.map((j) => (
                      <TableRow key={j.id}>
                        <TableCell>{new Date(j.scheduledAt).toLocaleString()}</TableCell>
                        <TableCell>{j.status}</TableCell>
                        <TableCell>{j.client?.name ?? j.clientId}</TableCell>
                        <TableCell>{j.car?.plateNumber ?? j.carId}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" className="h-7 gap-1" onClick={() => openCommentsModal(j.id)}>
                            <MessageSquare className="size-3.5" />
                            {t('pages.washJobsList.commentsAction')}
                            {(j.comments?.length ?? 0) > 0 && (
                              <span className="text-muted-foreground"> ({j.comments!.length})</span>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                <p className="text-muted-foreground text-sm">{t('common.total')}: {data.total}</p>
                {data.total > PAGE_SIZE && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page <= 1}>
                      First
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                      {t('pages.carsList.pageOf', { current: page, total: totalPages })}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                      Next
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
                      Last
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {viewMode === 'calendar' && calendarLoading && <ListPageSkeleton rows={6} cols={7} />}
          {viewMode === 'calendar' && !calendarLoading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const [y, m] = calendarMonth.split('-').map(Number);
                    setCalendarMonth(m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`);
                  }}
                >
                  ←
                </Button>
                <span className="text-sm font-medium capitalize">
                  {new Date(calendarMonth + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const [y, m] = calendarMonth.split('-').map(Number);
                    setCalendarMonth(m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`);
                  }}
                >
                  →
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <th key={d} className="border border-border bg-muted/50 p-1.5 text-center font-medium text-muted-foreground">
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getCalendarWeeks(calendarMonth).map((week, wi) => (
                      <tr key={wi}>
                        {week.map((day, di) => {
                          const dateKey = day == null ? null : `${calendarMonth}-${String(day).padStart(2, '0')}`;
                          const jobs = dateKey ? jobsByDay.get(dateKey) ?? [] : [];
                          const isToday = dateKey === today;
                          return (
                            <td
                              key={di}
                              className="align-top border border-border p-1 min-w-[80px] min-h-[80px] bg-background"
                            >
                              {day != null && (
                                <>
                                  <div
                                    className={`text-right text-xs font-medium mb-1 ${isToday ? 'rounded bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center ml-auto' : 'text-muted-foreground'}`}
                                  >
                                    {day}
                                  </div>
                                  <div className="space-y-1">
                                    {jobs.slice(0, 4).map((j) => (
                                      <div
                                        key={j.id}
                                        className="flex items-center gap-1 rounded border bg-muted/50 px-1.5 py-0.5 text-xs min-w-0"
                                        title={`${j.client?.name ?? j.clientId} – ${j.car?.plateNumber ?? j.carId} (${j.status})`}
                                      >
                                        <span className="font-medium truncate">{j.client?.name ?? j.clientId}</span>
                                        <span className="text-muted-foreground shrink-0">{j.car?.plateNumber ?? j.carId}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 w-5 p-0 shrink-0"
                                          onClick={() => openCommentsModal(j.id)}
                                          title={t('pages.washJobsList.commentsAction')}
                                        >
                                          <MessageSquare className="size-3" />
                                        </Button>
                                      </div>
                                    ))}
                                    {jobs.length > 4 && (
                                      <p className="text-xs text-muted-foreground">+{jobs.length - 4} more</p>
                                    )}
                                  </div>
                                </>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {commentJobId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeCommentsModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="comment-modal-title"
        >
          <Card
            className="w-full max-w-lg max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
              <CardTitle id="comment-modal-title" className="text-lg">
                {t('pages.washJobsList.comments')}
                {data?.items && (() => {
                  const job = data.items.find((j) => j.id === commentJobId);
                  return job ? ` – ${job.client?.name ?? job.clientId} (${job.car?.plateNumber ?? job.carId})` : '';
                })()}
              </CardTitle>
              <Button type="button" variant="ghost" size="icon" aria-label={t('pages.washJobsList.close')} onClick={closeCommentsModal}>
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{t('pages.washJobsList.comments')}</h4>
                {commentsLoading ? (
                  <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                ) : commentsList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('pages.washJobsList.noCommentsYet')}</p>
                ) : (
                  <ul className="space-y-2">
                    {commentsList.map((c) => (
                      <li key={c.id} className="rounded-md border bg-muted/30 p-2 text-sm">
                        {editingCommentId === c.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="min-h-16 text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateCommentMutation.mutate({ jobId: commentJobId, commentId: c.id, text: editingText.trim() })}
                                disabled={!editingText.trim() || updateCommentMutation.isPending}
                              >
                                {t('common.save')}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setEditingCommentId(null); setEditingText(''); }}>
                                {t('common.cancel')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="whitespace-pre-wrap">{c.text}</p>
                              <p className="text-xs text-muted-foreground mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label={t('pages.washJobsList.editComment')}
                                onClick={() => { setEditingCommentId(c.id); setEditingText(c.text); }}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                aria-label={t('pages.washJobsList.deleteComment')}
                                onClick={() => {
                                  if (window.confirm(t('pages.washJobsList.confirmDeleteComment'))) {
                                    deleteCommentMutation.mutate({ jobId: commentJobId, commentId: c.id });
                                  }
                                }}
                                disabled={deleteCommentMutation.isPending}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Add new comment */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="comment-text">{t('pages.washJobsList.addNewComment')}</Label>
                <Textarea
                  id="comment-text"
                  placeholder={t('pages.washJobsList.commentPlaceholder')}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-20"
                />
                <Button
                  onClick={() => addCommentMutation.mutate({ jobId: commentJobId, text: commentText.trim() })}
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                >
                  {t('pages.washJobsList.addComment')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
