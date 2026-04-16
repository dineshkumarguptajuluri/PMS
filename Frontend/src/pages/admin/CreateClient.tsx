import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { UserPlus, Mail, Lock, Building } from 'lucide-react';

const CreateClient: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    legalName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.legalName) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/admin/clients', formData);
      const userId = response.data.user?.id;
      toast.success('Client account created! Redirecting to Step 2: Onboarding Details...');
      
      // Delay slightly for toast visibility
      setTimeout(() => {
        if (userId) {
          navigate(`/admin/clients/onboard/${userId}`);
        } else {
          setFormData({ email: '', password: '', legalName: '' });
        }
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create client account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Create New Client</h1>
        <p className="text-text-muted">Step 1: Create the initial user account and profile.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input 
              label="Legal Company Name" 
              placeholder="Full Legal Name" 
              icon={<Building size={18} />} 
              value={formData.legalName}
              onChange={(e: any) => setFormData({...formData, legalName: e.target.value})}
            />
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="client@company.com" 
              icon={<Mail size={18} />} 
              value={formData.email}
              onChange={(e: any) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Initial Password" 
              type="password" 
              placeholder="Minimum 6 characters" 
              icon={<Lock size={18} />} 
              value={formData.password}
              onChange={(e: any) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full" 
              isLoading={isSubmitting}
            >
              <UserPlus size={18} className="mr-2" />
              Create Client Account
            </Button>
          </div>
        </form>
      </Card>

      <div className="bg-primary-blue/5 border border-primary-blue/10 p-6 rounded-2xl flex items-start space-x-4">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Building className="text-primary-blue" size={20} />
        </div>
        <div className="text-sm">
          <h4 className="font-bold text-primary-blue">What happens next?</h4>
          <p className="text-text-secondary mt-1">Once created, you will be redirected to the 4-step Administrative Onboarding form. You will need to enter the client's detailed company, location, and legal information to complete their profile registration.</p>
        </div>
      </div>
    </div>
  );
};

export default CreateClient;
