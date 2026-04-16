import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { UserPlus, Mail, Lock, CheckCircle2, Building } from 'lucide-react';

const ManagerCreateClient: React.FC = () => {
  const navigate = useNavigate();
  const [userForm, setUserForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Step 1: Create USER with role CLIENT
      const response = await apiClient.post('/users/create', {
        email: userForm.email,
        password: userForm.password,
        role: 'CLIENT',
      });
      
      const userId = response.data.user?.id || response.data.id;
      toast.success('Client account created! Redirecting to Step 2: Onboarding Wizard...');
      
      setTimeout(() => {
        if (userId) {
          navigate(`/manager/clients/onboard/${userId}`);
        } else {
          setUserForm({ email: '', password: '' });
        }
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create client account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Client Registration</h1>
        <p className="text-text-muted">Step 1: Create the client account credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="animate-in fade-in duration-300">
            <CardHeader>
              <CardTitle>Create Client Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-text-muted" size={18} />
                      <input
                        required
                        type="email"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                        value={userForm.email}
                        onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                        placeholder="client@company.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Initial Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-text-muted" size={18} />
                      <input
                        required
                        type="password"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                        value={userForm.password}
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  <UserPlus size={18} className="mr-2" />
                  Create Account & Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-bg-soft/50 border-none h-full">
            <CardHeader>
              <CardTitle className="text-base">Onboarding Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-primary-blue">
                  <CheckCircle2 size={16} className="mt-1" />
                  <p className="text-xs text-text-secondary leading-normal font-bold">
                    Step 1: Create Account
                  </p>
                </li>
                <li className="flex items-start space-x-3 text-text-muted">
                  <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px] mt-0.5">2</span>
                  <p className="text-xs leading-normal">
                    Step 2: Enter Company Info
                  </p>
                </li>
                <li className="flex items-start space-x-3 text-text-muted">
                  <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px] mt-0.5">3</span>
                  <p className="text-xs leading-normal">
                    Step 3: Location & Markets
                  </p>
                </li>
                <li className="flex items-start space-x-3 text-text-muted">
                  <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px] mt-0.5">4</span>
                  <p className="text-xs leading-normal">
                    Step 4: Points of Contact
                  </p>
                </li>
              </ul>

              <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-primary-blue/10">
                <div className="flex items-center space-x-2 text-primary-blue mb-2">
                  <Building size={16} />
                  <p className="text-[10px] font-bold uppercase">Staff-Led Onboarding</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  As a Manager, you are responsible for entering the detailed business profile for your clients. After creating the account, you will be guided through a 4-step wizard to capture all necessary metadata.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerCreateClient;
