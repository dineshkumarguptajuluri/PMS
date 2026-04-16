import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { UserPlus, Mail, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CLIENT';
  clientProfile?: {
    onboardingStatus: string;
    legalName?: string;
  };
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'MANAGER' as const,
  });

  const toast = useToast();

  const fetchUsers = async () => {
    try {
      // Backend route is GET /api/admin/users
      const response = await apiClient.get('/admin/users'); 
      // Handle both array (legacy) and paginated object responses
      const data = response.data;
      setUsers(Array.isArray(data) ? data : data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/users/create', formData);
      toast.success('User created successfully');
      setShowForm(false);
      setFormData({ email: '', password: '', role: 'MANAGER' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      // Backend route is DELETE /api/admin/users/:id
      await apiClient.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-muted">Manage system users and their access levels.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus size={18} className="mr-2" />
          {showForm ? 'Cancel' : 'Create User'}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-border-subtle bg-bg-card text-text-primary focus:ring-2 focus:ring-primary-blue outline-none transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input
                  required
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border border-border-subtle bg-bg-card text-text-primary focus:ring-2 focus:ring-primary-blue outline-none transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-border-subtle bg-bg-card text-text-primary focus:ring-2 focus:ring-primary-blue outline-none transition-colors"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                >
                  <option value="ADMIN" className="bg-bg-card">Administrator</option>
                  <option value="MANAGER" className="bg-bg-card">Project Manager</option>
                  <option value="CLIENT" className="bg-bg-card">Client</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" isLoading={isSubmitting} className="w-full md:w-auto">
                  Confirm Creation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-bg-soft">
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-bg-soft/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center font-bold text-sm">
                        {user.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-text-muted">#{user.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-text-secondary">
                      <Mail size={14} className="mr-2" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'ADMIN' ? 'info' : user.role === 'MANAGER' ? 'action' : 'warning'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {user.role === 'CLIENT' && user.clientProfile?.onboardingStatus === 'PENDING_ONBOARDING' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/admin/clients/onboard/${user.id}`)}
                        >
                          <ExternalLink size={14} className="mr-1" />
                          Onboard
                        </Button>
                      ) : user.role === 'CLIENT' ? (
                        <span className="text-[10px] font-bold text-text-muted uppercase bg-bg-soft px-2 py-1 rounded transition-colors border border-border-subtle">
                          {user.clientProfile?.onboardingStatus.replace('_', ' ')}
                        </span>
                      ) : null}
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;
