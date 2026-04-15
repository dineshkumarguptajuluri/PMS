import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.post('/users/login', { email, password });
      const { user, token } = response.data;
      
      login(user, token);
      toast.success('Login successful!');

      // Determine where to redirect
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        const dashboardMap = {
          ADMIN: '/admin/dashboard',
          MANAGER: '/manager/dashboard',
          CLIENT: '/client/dashboard',
        };
        navigate(dashboardMap[user.role as keyof typeof dashboardMap], { replace: true });
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Invalid credentials';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-blue bg-primary-gradient bg-clip-text text-transparent">
            PM Portal
          </h1>
          <p className="text-text-secondary mt-2">Sign in to manage your projects</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-blue focus:ring-primary-blue" />
                  <span className="text-text-secondary">Remember me</span>
                </label>
                <a href="#" className="text-primary-blue hover:underline">Forgot password?</a>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-sm text-text-secondary">
          Don't have an account? <span className="text-primary-blue">Contact your administrator</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
