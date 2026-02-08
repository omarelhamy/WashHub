import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Moon,
  Sun,
  LayoutDashboard,
  Building2,
  Users,
  Car,
  ClipboardList,
  Package,
  UserPlus,
  CreditCard,
  MessageSquare,
  QrCode,
  LogOut,
  Settings,
} from 'lucide-react';
import { clearToken, getUserType } from '@/lib/auth';
import { setRtl } from '@/lib/i18n';
import { getTheme, setTheme, type Theme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function NavLink({
  to,
  children,
  icon: Icon,
}: {
  to: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
    >
      <Icon className="size-4 shrink-0" />
      {children}
    </Link>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const type = getUserType();
  const [theme, setThemeState] = useState<Theme>(() => getTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    setRtl(next);
  };

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <Link to={type === 'SUPER_ADMIN' ? '/super' : type === 'PROVIDER_WORKER' ? '/worker' : '/provider'} className="font-semibold text-sidebar-foreground">
            {t('app.title')}
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {type === 'SUPER_ADMIN' && (
            <>
              <p className="px-3 mb-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">General</p>
              <NavLink to="/super" icon={LayoutDashboard}>{t('nav.dashboard')}</NavLink>
              <NavLink to="/super/providers" icon={Building2}>{t('nav.providers')}</NavLink>
              <NavLink to="/super/clients" icon={Users}>{t('nav.clients')}</NavLink>
              <NavLink to="/super/settings" icon={Settings}>{t('nav.settings')}</NavLink>
            </>
          )}
          {(type === 'PROVIDER_ADMIN' || type === 'PROVIDER_WORKER') && (
            <>
              <p className="px-3 mb-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">General</p>
              <NavLink to={type === 'PROVIDER_WORKER' ? '/worker' : '/provider'} icon={LayoutDashboard}>{t('nav.dashboard')}</NavLink>
              {type === 'PROVIDER_ADMIN' && (
                <>
                  <NavLink to="/provider/clients" icon={Users}>{t('nav.clients')}</NavLink>
                  <NavLink to="/provider/cars" icon={Car}>{t('nav.cars')}</NavLink>
                  <NavLink to="/provider/wash-jobs" icon={ClipboardList}>{t('nav.washJobs')}</NavLink>
                  <NavLink to="/provider/wash-plans" icon={Package}>{t('nav.plans')}</NavLink>
                  <NavLink to="/provider/enrollment" icon={UserPlus}>{t('nav.enrollment')}</NavLink>
                  <NavLink to="/provider/payments" icon={CreditCard}>{t('nav.payments')}</NavLink>
                  <NavLink to="/provider/client-comments" icon={MessageSquare}>{t('nav.clientComments')}</NavLink>
                  <NavLink to="/provider/qr" icon={QrCode}>{t('nav.qr')}</NavLink>
                </>
              )}
              {type === 'PROVIDER_WORKER' && (
                <NavLink to="/worker/tasks" icon={ClipboardList}>{t('nav.tasks')}</NavLink>
              )}
            </>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="size-4 mr-3" /> : <Moon className="size-4 mr-3" />}
            {theme === 'dark' ? t('common.themeLight') : t('common.themeDark')}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={toggleLang}>
            {i18n.language === 'en' ? 'AR' : 'EN'}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="size-4 mr-3" />
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center justify-end gap-2 px-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === 'dark' ? t('common.themeLight') : t('common.themeDark')}>
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLang}>{i18n.language === 'en' ? 'AR' : 'EN'}</Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            {t('nav.logout')}
          </Button>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
