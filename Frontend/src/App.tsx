import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
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

function App() {
  return (
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
            path="/admin/clients/pending"
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
            path="/manager/clients"
            element={
              <RoleRoute allowedRoles={['MANAGER']}>
                <ManagerClients />
              </RoleRoute>
            }
          />

          {/* Client Routes */}
          <Route
            path="/projects/discovery"
            element={
              <RoleRoute allowedRoles={['CLIENT']}>
                <ClientDiscovery />
              </RoleRoute>
            }
          />
          <Route
            path="/projects/active"
            element={
              <RoleRoute allowedRoles={['CLIENT']}>
                <ClientActiveProjects />
              </RoleRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <RoleRoute allowedRoles={['CLIENT']}>
                <ClientProjectDetails />
              </RoleRoute>
            }
          />
          <Route
            path="/client/dashboard"
            element={
              <RoleRoute allowedRoles={['CLIENT']}>
                <ClientDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/client/interests"
            element={
              <RoleRoute allowedRoles={['CLIENT']}>
                <ClientInterests />
              </RoleRoute>
            }
          />
        </Route>

        {/* Default / Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Global Components */}
      <ToastContainer />
    </Router>
  );
}

export default App;
