import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Settings, Building2 } from 'lucide-react';
import { ListPageSkeleton } from '@/components/ListPageSkeleton';

interface Provider {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const { t } = useTranslation();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data } = await api.get<{ items: Provider[] }>('/providers?limit=200');
      return data;
    },
  });

  if (isLoading) return <ListPageSkeleton rows={5} cols={2} />;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex items-center gap-2">
        <Settings className="size-7 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.settings.title')}</h1>
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('pages.settings.platform')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Platform-wide settings can be configured here. (Placeholder for future app name, default currency, etc.)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('pages.settings.providerSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Edit each provider&apos;s settings (price, subscription, trial end date) from their detail page.
          </p>
          <ul className="space-y-2">
            {(providers?.items ?? []).map((p) => (
              <li key={p.id}>
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto justify-start">
                  <Link to={`/super/providers/${p.id}`}>
                    <Building2 className="mr-2 size-4" /> {p.name}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
