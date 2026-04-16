import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';

const ClientOnboardingStatus: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/clients/profile');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="h-96 w-full animate-pulse bg-bg-soft rounded-2xl" />;
  }

  const status = user?.onboardingStatus || profile?.onboardingStatus || 'PENDING_ONBOARDING';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Registration Status</h1>
        <p className="text-text-muted">Track your company's platform onboarding journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border-2 transition-all ${status === 'APPROVED' ? 'bg-success/5 border-success/20' : 'bg-primary-blue/5 border-primary-blue/20'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${status === 'APPROVED' ? 'bg-success text-white' : 'bg-primary-blue text-white'}`}>
              {status === 'APPROVED' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Stage 1</span>
          </div>
          <h3 className="font-bold text-text-primary">Data Entry</h3>
          <p className="text-xs text-text-secondary mt-1">Complete information provided by account manager.</p>
        </div>

        <div className={`p-6 rounded-2xl border-2 transition-all ${status === 'APPROVED' ? 'bg-success/5 border-success/20' : status === 'PENDING_APPROVAL' ? 'bg-warning/5 border-warning/20 animate-pulse' : 'bg-bg-soft border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${status === 'APPROVED' ? 'bg-success text-white' : status === 'PENDING_APPROVAL' ? 'bg-warning text-white' : 'bg-gray-200 text-gray-400'}`}>
              <ShieldCheck size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Stage 2</span>
          </div>
          <h3 className="font-bold text-text-primary">Admin Review</h3>
          <p className="text-xs text-text-secondary mt-1">Platform administrators verifying documentation.</p>
        </div>

        <div className={`p-6 rounded-2xl border-2 transition-all ${status === 'APPROVED' ? 'bg-success/5 border-success/20 shadow-lg shadow-success/10' : 'bg-bg-soft border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${status === 'APPROVED' ? 'bg-success text-white' : 'bg-gray-200 text-gray-400'}`}>
              <CheckCircle2 size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Stage 3</span>
          </div>
          <h3 className="font-bold text-text-primary">Active Access</h3>
          <p className="text-xs text-text-secondary mt-1">Full dashboard and project discovery enabled.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className={`h-2 w-full ${status === 'APPROVED' ? 'bg-success' : status === 'PENDING_APPROVAL' ? 'bg-warning' : 'bg-primary-blue'}`} />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-bg-soft border border-gray-100 text-xs font-bold text-text-muted">
                Current Status: <span className={`ml-2 ${status === 'APPROVED' ? 'text-success' : 'text-primary-blue'}`}>{status.replace('_', ' ')}</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary">
                {status === 'APPROVED' 
                  ? "Your account is fully activated!" 
                  : status === 'PENDING_APPROVAL' 
                  ? "We're verifying your details" 
                  : "Onboarding In Progress"}
              </h2>
              <p className="text-text-muted max-w-md">
                {status === 'APPROVED' 
                  ? "Welcome to the platform. You can now browse available projects and manage your active utility optimizations." 
                  : "Your account manager has submitted your business profile. Our administration team is now reviewing the GST, legal, and operational data provided."}
              </p>
              {status === 'APPROVED' && (
                <Button variant="primary" onClick={() => window.location.href = '/client/dashboard'}>
                  Go to Dashboard
                </Button>
              )}
            </div>

            <div className="relative">
              <div className={`h-32 w-32 rounded-full border-8 flex items-center justify-center transition-all duration-1000 ${status === 'APPROVED' ? 'border-success rotate-0' : 'border-primary-blue/20 rotate-180'}`}>
                {status === 'APPROVED' ? (
                  <CheckCircle2 size={48} className="text-success" />
                ) : (
                  <RefreshCcw size={48} className="text-primary-blue animate-spin-slow" />
                )}
              </div>
              {status !== 'APPROVED' && (
                <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-lg shadow-md border border-gray-50">
                  <AlertCircle size={20} className="text-warning" />
                </div>
              )}
            </div>
          </div>

          {status !== 'APPROVED' && (
            <div className="mt-8 flex justify-center border-t pt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="text-primary-blue border-primary-blue/20"
              >
                <RefreshCcw size={16} className="mr-2" />
                Check for Updates
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {profile && (
        <Card className="bg-bg-soft/30 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">Company Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-[10px] text-text-muted uppercase font-black">Legal Name</p>
                <p className="text-sm font-bold">{profile.legalName || 'Pending'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase font-black">GST Number</p>
                <p className="text-sm font-bold">{profile.gstNumber || 'Pending'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase font-black">Industry</p>
                <p className="text-sm font-bold">{profile.industryType || 'Pending'}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase font-black">Documents</p>
                <p className="text-sm font-bold">{profile.documents?.length || 0} Attached</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientOnboardingStatus;
