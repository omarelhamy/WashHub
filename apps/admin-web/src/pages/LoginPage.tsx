import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { setToken, getPayload } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const ADMIN_LOGIN_PATH = '/admin/login';
const PROVIDER_LOGIN_PATH = '/provider/login';

function isProviderLogin(pathname: string) {
  return pathname === PROVIDER_LOGIN_PATH;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const providerLogin = isProviderLogin(pathname);

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
      if (providerLogin) {
        const { data } = await api.post<{ access_token: string }>('/auth/provider/login', { phone, password });
        setToken(data.access_token);
      } else {
        const { data } = await api.post<{ access_token: string }>('/auth/super-admin/login', { email, password });
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

  const title = providerLogin ? t('pages.login.titleProvider') : t('pages.login.titleAdmin');
  const subtitle = providerLogin ? t('pages.login.subtitleProvider') : t('pages.login.subtitle');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('pages.login.appTitle')}</h1>
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {providerLogin ? (
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
                  />
                </div>
              ) : (
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
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
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
