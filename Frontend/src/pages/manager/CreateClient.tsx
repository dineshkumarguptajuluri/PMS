import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';

const ManagerCreateClient: React.FC = () => {
  // Step 1: Create User Account
  const [userForm, setUserForm] = useState({ email: '', password: '' });
  
  // Step 2: Onboard Client Profile  
  const [onboardForm, setOnboardForm] = useState({
    userId: '',
    legalName: '',
    gstNumber: '',
    industryType: '',
    employeeCount: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

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
      setCreatedUserId(userId);
      setOnboardForm({ ...onboardForm, userId: String(userId) });
      setStep(2);
      toast.success('Client account created! Now complete the profile.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create client account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Step 2: POST /clients/onboard with multipart/form-data
      const data = new FormData();
      data.append('userId', onboardForm.userId);
      data.append('legalName', onboardForm.legalName);
      if (onboardForm.gstNumber) data.append('gstNumber', onboardForm.gstNumber);
      if (onboardForm.industryType) data.append('industryType', onboardForm.industryType);
      if (onboardForm.employeeCount) data.append('employeeCount', onboardForm.employeeCount);
      
      files.forEach(file => {
        data.append('files', file);
      });

      await apiClient.post('/clients/onboard', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Client onboarded successfully!');
      // Reset
      setUserForm({ email: '', password: '' });
      setOnboardForm({ userId: '', legalName: '', gstNumber: '', industryType: '', employeeCount: '' });
      setFiles([]);
      setStep(1);
      setCreatedUserId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to onboard client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Client Onboarding</h1>
        <p className="text-text-muted">Create a client account and register their business profile.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${step === 1 ? 'bg-primary-blue text-white' : 'bg-success/10 text-success'}`}>
          {step > 1 ? <CheckCircle2 size={16} /> : <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>}
          <span>Account Creation</span>
        </div>
        <div className="h-px flex-1 bg-gray-200" />
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${step === 2 ? 'bg-primary-blue text-white' : 'bg-bg-soft text-text-muted'}`}>
          <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
          <span>Business Profile</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 ? (
            <Card className="animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle>Create Client Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <input
                        required
                        type="email"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                        value={userForm.email}
                        onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                        placeholder="client@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <input
                        required
                        type="password"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                        value={userForm.password}
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <Button type="submit" isLoading={isSubmitting}>
                    Create Account & Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <p className="text-xs text-text-muted mt-1">User ID: <span className="font-bold text-primary-blue">#{createdUserId}</span></p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOnboard} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Legal Name *</label>
                      <input
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                        value={onboardForm.legalName}
                        onChange={(e) => setOnboardForm({...onboardForm, legalName: e.target.value})}
                        placeholder="Acme Corp Pvt Ltd"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">GST Number</label>
                      <input
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                        value={onboardForm.gstNumber}
                        onChange={(e) => setOnboardForm({...onboardForm, gstNumber: e.target.value})}
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Industry Type</label>
                      <input
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                        value={onboardForm.industryType}
                        onChange={(e) => setOnboardForm({...onboardForm, industryType: e.target.value})}
                        placeholder="Energy / Technology / Finance"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Employee Count</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue text-sm"
                        value={onboardForm.employeeCount}
                        onChange={(e) => setOnboardForm({...onboardForm, employeeCount: e.target.value})}
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h4 className="text-sm font-bold text-text-primary">Documentation</h4>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-blue/50 hover:bg-primary-blue/5 transition-all cursor-pointer relative">
                      <input 
                        type="file" 
                        multiple 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleFileChange}
                      />
                      <Upload className="mx-auto text-text-muted mb-2" size={32} />
                      <p className="text-sm font-medium text-text-primary">Click or drag files to upload</p>
                      <p className="text-xs text-text-muted mt-1">GST Certificate, Contracts, ID Proofs</p>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-2">
                        {files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-bg-soft rounded-lg border border-gray-100">
                            <div className="flex items-center space-x-3">
                              <FileText size={18} className="text-primary-blue" />
                              <span className="text-xs font-semibold">{file.name}</span>
                              <span className="text-[10px] text-text-muted uppercase">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                            <button onClick={() => removeFile(idx)} className="p-1 hover:text-danger">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 flex space-x-3">
                    <Button type="submit" isLoading={isSubmitting}>
                      Complete Onboarding
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-bg-soft/50 border-none h-full">
            <CardHeader>
              <CardTitle className="text-base">Onboarding Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 size={16} className={`mt-1 ${step > 1 ? 'text-success' : 'text-text-muted'}`} />
                  <p className="text-xs text-text-secondary leading-normal">
                    Create client user account with email and password.
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 size={16} className={`mt-1 ${step === 2 ? 'text-primary-blue' : 'text-text-muted'}`} />
                  <p className="text-xs text-text-secondary leading-normal">
                    Fill in legal business name and organization details.
                  </p>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 size={16} className="text-text-muted mt-1" />
                  <p className="text-xs text-text-secondary leading-normal">
                    Upload supporting documents (GST, contracts).
                  </p>
                </li>
              </ul>

              <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-orange-100">
                <p className="text-[10px] font-bold text-orange-600 uppercase mb-2">Note</p>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                  The backend uses a 2-step process: first create the user (POST /users/create), then register the business profile (POST /clients/onboard).
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
