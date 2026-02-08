import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import LoginLandingPage from './pages/LoginLandingPage';
import SuperDashboard from './pages/super/SuperDashboard';
import ProvidersList from './pages/super/ProvidersList';
import SuperClientsList from './pages/super/SuperClientsList';
import SuperClientDetailPage from './pages/super/SuperClientDetailPage';
import SuperClientEditPage from './pages/super/SuperClientEditPage';
import SuperProviderDetail from './pages/super/SuperProviderDetail';
import CreateProvider from './pages/super/CreateProvider';
import EditProvider from './pages/super/EditProvider';
import SuperPlans from './pages/super/SuperPlans';
import SuperPlansLanding from './pages/super/SuperPlansLanding';
import SettingsPage from './pages/super/SettingsPage';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ClientsList from './pages/provider/ClientsList';
import CarsList from './pages/provider/CarsList';
import WashJobsList from './pages/provider/WashJobsList';
import WashPlansList from './pages/provider/WashPlansList';
import EnrollmentWizard from './pages/provider/EnrollmentWizard';
import PaymentsList from './pages/provider/PaymentsList';
import ClientCommentsPage from './pages/provider/ClientCommentsPage';
import ClientDetailPage from './pages/provider/ClientDetailPage';
import QRPage from './pages/provider/QRPage';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import PublicEnrollPage from './pages/public/PublicEnrollPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<LoginLandingPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/provider/login" element={<LoginPage />} />
            <Route path="/enroll" element={<PublicEnrollPage />} />
          <Route element={<ProtectedRoute allowed={['SUPER_ADMIN']} />}>
            <Route element={<Layout />}>
              <Route path="/super" element={<SuperDashboard />} />
              <Route path="/super/providers" element={<ProvidersList />} />
              <Route path="/super/providers/new" element={<CreateProvider />} />
              <Route path="/super/providers/:id" element={<SuperProviderDetail />} />
              <Route path="/super/providers/:id/edit" element={<EditProvider />} />
              <Route path="/super/providers/:id/plans" element={<SuperPlans />} />
              <Route path="/super/clients" element={<SuperClientsList />} />
              <Route path="/super/clients/:id" element={<SuperClientDetailPage />} />
              <Route path="/super/clients/:id/edit" element={<SuperClientEditPage />} />
              <Route path="/super/plans" element={<SuperPlansLanding />} />
              <Route path="/super/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowed={['PROVIDER_ADMIN']} />}>
            <Route element={<Layout />}>
              <Route path="/provider" element={<ProviderDashboard />} />
              <Route path="/provider/clients" element={<ClientsList />} />
              <Route path="/provider/clients/:id" element={<ClientDetailPage />} />
              <Route path="/provider/cars" element={<CarsList />} />
              <Route path="/provider/wash-jobs" element={<WashJobsList />} />
              <Route path="/provider/wash-plans" element={<WashPlansList />} />
              <Route path="/provider/enrollment" element={<EnrollmentWizard />} />
              <Route path="/provider/payments" element={<PaymentsList />} />
              <Route path="/provider/client-comments" element={<ClientCommentsPage />} />
              <Route path="/provider/qr" element={<QRPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowed={['PROVIDER_WORKER']} />}>
            <Route element={<Layout />}>
              <Route path="/worker" element={<WorkerDashboard />} />
              <Route path="/worker/tasks" element={<WorkerDashboard />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
