import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginLandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.login.appTitle')}</h1>
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">{t('pages.login.chooseLogin')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('pages.login.chooseLoginSubtitle')}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild variant="default" size="lg" className="w-full justify-start gap-3 rounded-xl">
              <Link to="/admin/login">
                <Shield className="size-5" aria-hidden />
                {t('pages.login.superAdmin')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full justify-start gap-3 rounded-xl h-11">
              <Link to="/provider/login">
                <Building2 className="size-5" aria-hidden />
                {t('pages.login.provider')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
