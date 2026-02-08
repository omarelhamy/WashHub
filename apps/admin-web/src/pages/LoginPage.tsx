import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { setToken, getPayload } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

type LoginMode = 'super' | 'provider';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('super');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'super') {
        const { data } = await api.post<{ access_token: string }>('/auth/super-admin/login', { email, password });
        setToken(data.access_token);
      } else {
        const { data } = await api.post<{ access_token: string }>('/auth/provider/login', {
          phone,
          password,
          providerId,
        });
        setToken(data.access_token);
      }
      const payload = getPayload();
      if (payload?.type === 'SUPER_ADMIN') navigate('/super');
      else if (payload?.type === 'PROVIDER_ADMIN') navigate('/provider');
      else if (payload?.type === 'PROVIDER_WORKER') navigate('/worker');
      else navigate('/');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-2xl font-semibold text-foreground">{t('pages.login.appTitle')}</span>
        </div>
        <Card className="w-full shadow-lg border border-border/80 rounded-lg">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">{t('pages.login.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('pages.login.subtitle')}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'super' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setMode('super')}
                disabled={loading}
              >
                {t('pages.login.superAdmin')}
              </Button>
              <Button
                type="button"
                variant={mode === 'provider' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setMode('provider')}
                disabled={loading}
              >
                {t('pages.login.provider')}
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'super' ? (
                <div className="space-y-2">
                  <Label htmlFor="email">{t('pages.login.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-background"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('pages.login.phone')}</Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder={t('pages.login.phone')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-background"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">{t('pages.login.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    {t('pages.login.signingIn')}
                  </>
                ) : (
                  t('pages.login.login')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
