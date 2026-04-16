import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import ClientGate from './components/auth/ClientGate';
import DashboardLayout from './layouts/DashboardLayout';
import ToastContainer from './components/ui/ToastContainer';

// Common Pages
import Login from './pages/common/Login';
import Unauthorized from './pages/common/Unauthorized';
import NotFound from './pages/common/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPendingClients from './pages/admin/PendingClients';
import AdminProjects from './pages/admin/Projects';
import AdminInterests from './pages/admin/Interests';
import AdminCheckpoints from './pages/admin/Checkpoints';
import AdminPerformance from './pages/admin/Performance';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerProjects from './pages/manager/Projects';
import ManagerProjectDetails from './pages/manager/ProjectDetails';
import ManagerCheckpoints from './pages/manager/Checkpoints';
import ManagerInterests from './pages/manager/Interests';
import ManagerCreateClient from './pages/manager/CreateClient';
import ManagerClients from './pages/manager/Clients';

// Client Pages
import ClientDiscovery from './pages/client/Discovery';
import ClientActiveProjects from './pages/client/ActiveProjects';
import ClientProjectDetails from './pages/client/ProjectDetails';
import ClientDashboard from './pages/client/Dashboard';
import ClientInterests from './pages/client/Interests';
import ClientOnboarding from './pages/client/Onboarding';

// Admin Onboarding
import AdminCreateClient from './pages/admin/CreateClient';
import OnboardClient from './pages/admin/OnboardClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/clients/create"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminCreateClient />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/clients/onboard/:userId"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <OnboardClient />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/clients/onboarding-requests"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminPendingClients />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminProjects />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/interests"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminInterests />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/checkpoints/:projectId"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminCheckpoints />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/performance"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminPerformance />
              </RoleRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <RoleRoute allowedRoles={['MANAGER']}>
                <ManagerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/manager/projects"
            element={
              <RoleRoute allowedRoles={['MANAGER']}>
                <ManagerProjects />
              </RoleRoute>
            }
          />
          <Route
            path="/manager/projects/:id"
            element={
              <RoleRoute allowedRoles={['MANAGER']}>
                <ManagerProjectDetails />
              </RoleRoute>
            }
          />
          <Route
            path="/manager/checkpoints/:projectId"
            element={
              <RoleRoute allowedRoles={['MANAGER']}>
                <ManagerCheckpoints />
              </RoleRoute>
            }
          />
          <Route
            path="/manager/interests"
            element={
              <RoleRoute allowedRoles={['MANAGER']}>
                <ManagerInterests />
              </RoleRoute>
            }
          />
          <Route
            path="/manager/create-client"
            element={
              <RoleRoute allowedRoles={['MANAGER']}>
                <ManagerCreateClient />
              </RoleRoute>
            }
          />
          <Route
            path="/manager/clients/onboard/:userId"
            element={
              <RoleRoute allowedRoles={['MANAGER']}>
                <OnboardClient />
              </RoleRoute>
            }
          />
          <Route
            path="/manager/clients"
            element={
              <RoleRoute allowedRoles={['MANAGER']}>
                <ManagerClients />
              </RoleRoute>
            }
          />

          {/* Client Routes */}
          <Route
            element={
              <RoleRoute allowedRoles={['CLIENT']}>
                <ClientGate>
                  <Outlet />
                </ClientGate>
              </RoleRoute>
            }
          >
            <Route path="/client/onboarding" element={<ClientOnboarding />} />
            <Route path="/projects/discovery" element={<ClientDiscovery />} />
            <Route path="/projects/active" element={<ClientActiveProjects />} />
            <Route path="/projects/:id" element={<ClientProjectDetails />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/interests" element={<ClientInterests />} />
          </Route>
        </Route>

        {/* Default / Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Global Components */}
      <ToastContainer />
    </Router>
    </QueryClientProvider>
  );
}

export default App;
