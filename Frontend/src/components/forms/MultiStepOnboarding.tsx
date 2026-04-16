import React, { useState, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Building2, MapPin, Users, ShieldCheck, ChevronRight, ChevronLeft, CheckCircle, Upload, FileText, X } from 'lucide-react';

interface MultiStepOnboardingProps {
  userId: number | string;
  onComplete?: () => void;
  title?: string;
  className?: string;
}

const MultiStepOnboarding: React.FC<MultiStepOnboardingProps> = ({ 
  userId, 
  onComplete, 
  title = "Client Onboarding",
  className = ""
}) => {
  const [step, setStep] = useState(1);
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    company: {
      name: '',
      legal_name: '',
      industry: '',
      sub_industry: '',
      size: ''
    },
    location: {
      hq: { address: '', city: '', country: '' },
      markets: [] as string[]
    },
    contacts: {
      primary: { name: '', role: '', email: '', phone: '' },
      finance: { name: '', role: '', email: '', phone: '' },
      it: { name: '', role: '', email: '', phone: '' }
    },
    legal: {
      gst: '',
      pan: '',
      cin: ''
    }
  });

  const updateFormData = (Section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [Section]: {
        ...(prev as any)[Section],
        [field]: value
      }
    }));
  };

  const updateNestedData = (section: string, subSection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [subSection]: {
          ...(prev as any)[section][subSection],
          [field]: value
        }
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error('Missing target user ID');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('userId', String(userId));
      data.append('company', JSON.stringify(formData.company));
      data.append('location', JSON.stringify(formData.location));
      data.append('contacts', JSON.stringify(formData.contacts));
      data.append('legal', JSON.stringify(formData.legal));
      
      files.forEach(file => {
        data.append('files', file);
      });

      await apiClient.post('/clients/onboard', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Onboarding data submitted successfully!');
      if (onComplete) onComplete();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit onboarding data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
        <p className="text-text-muted">Enter detailed metadata for client profile identification.</p>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-primary-blue text-white shadow-lg' : 'bg-bg-soft text-text-muted border border-border-subtle'}`}>
                {s}
              </div>
              {s < 5 && <div className={`w-12 h-1 transition-colors ${step > s ? 'bg-primary-blue' : 'bg-bg-soft'}`} />}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-8 shadow-xl border-border-subtle">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center space-x-3 text-primary-blue mb-2">
              <Building2 size={24} />
              <h2 className="text-xl font-bold">Company Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Company Name" placeholder="e.g. Acme Corp" value={formData.company.name} onChange={(e: any) => updateFormData('company', 'name', e.target.value)} />
              <Input label="Legal Name" placeholder="Full Registered Name" value={formData.company.legal_name} onChange={(e: any) => updateFormData('company', 'legal_name', e.target.value)} />
              <Input label="Industry" placeholder="e.g. Technology" value={formData.company.industry} onChange={(e: any) => updateFormData('company', 'industry', e.target.value)} />
              <Input label="Sub-Industry" placeholder="e.g. SaaS" value={formData.company.sub_industry} onChange={(e: any) => updateFormData('company', 'sub_industry', e.target.value)} />
              <Input label="Company Size" placeholder="e.g. 50-100 employees" value={formData.company.size} onChange={(e: any) => updateFormData('company', 'size', e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center space-x-3 text-primary-blue mb-2">
              <MapPin size={24} />
              <h2 className="text-xl font-bold">Location & Markets</h2>
            </div>
            <div className="space-y-6">
              <Input label="HQ Address" placeholder="Street, Building" value={formData.location.hq.address} onChange={(e: any) => updateNestedData('location', 'hq', 'address', e.target.value)} />
              <div className="grid grid-cols-2 gap-6">
                <Input label="City" value={formData.location.hq.city} onChange={(e: any) => updateNestedData('location', 'hq', 'city', e.target.value)} />
                <Input label="Country" value={formData.location.hq.country} onChange={(e: any) => updateNestedData('location', 'hq', 'country', e.target.value)} />
              </div>
              <Input label="Target Markets" placeholder="e.g. USA, Europe, India" onChange={(e: any) => updateFormData('location', 'markets', e.target.value.split(',').map((s: string) => s.trim()))} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center space-x-3 text-primary-blue mb-2">
              <Users size={24} />
              <h2 className="text-xl font-bold">Points of Contact</h2>
            </div>
            
            <div className="space-y-8">
              {['primary', 'finance', 'it'].map((contactType) => (
                <div key={contactType} className="p-6 bg-bg-soft rounded-xl space-y-4">
                  <h3 className="font-bold text-lg capitalize">{contactType} Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Name" value={(formData.contacts as any)[contactType].name} onChange={(e: any) => updateNestedData('contacts', contactType, 'name', e.target.value)} />
                    <Input label="Role" value={(formData.contacts as any)[contactType].role} onChange={(e: any) => updateNestedData('contacts', contactType, 'role', e.target.value)} />
                    <Input label="Email" value={(formData.contacts as any)[contactType].email} onChange={(e: any) => updateNestedData('contacts', contactType, 'email', e.target.value)} />
                    <Input label="Phone" value={(formData.contacts as any)[contactType].phone} onChange={(e: any) => updateNestedData('contacts', contactType, 'phone', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center space-x-3 text-primary-blue mb-2">
              <ShieldCheck size={24} />
              <h2 className="text-xl font-bold">Legal & Compliance</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <Input label="GST Number" placeholder="Enter GSTIN" value={formData.legal.gst} onChange={(e: any) => updateFormData('legal', 'gst', e.target.value)} />
              <Input label="PAN Number" placeholder="Enter PAN" value={formData.legal.pan} onChange={(e: any) => updateFormData('legal', 'pan', e.target.value)} />
              <Input label="CIN Number" placeholder="Enter CIN" value={formData.legal.cin} onChange={(e: any) => updateFormData('legal', 'cin', e.target.value)} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center space-x-3 text-primary-blue mb-2">
              <FileText size={24} />
              <h2 className="text-xl font-bold">Documentation</h2>
            </div>
            
            <div className="pt-4">
              <div 
                className="border-2 border-dashed border-primary-blue/20 rounded-2xl p-12 text-center hover:bg-primary-blue/5 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
                <div className="bg-primary-blue/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-primary-blue" size={32} />
                </div>
                <p className="text-sm font-bold text-text-primary">Click to upload company documents</p>
                <p className="text-xs text-text-muted mt-2">Support for PDF, JPG, PNG (GST Certificates, PAN Cards, etc.)</p>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-bg-soft/50 rounded-lg border border-border-subtle group transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-bg-card border border-border-subtle rounded flex items-center justify-center">
                          <FileText size={16} className="text-primary-blue" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate max-w-[150px] text-text-primary">{file.name}</p>
                          <p className="text-[10px] text-text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="p-1.5 hover:bg-danger/10 hover:text-danger rounded-md transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 p-6 border-dashed border-2 border-primary-blue/20 rounded-xl bg-primary-blue/5 flex flex-col items-center">
              <CheckCircle className="text-primary-blue mb-2" size={32} />
              <p className="text-sm font-medium">Ready to submit?</p>
              <p className="text-xs text-text-muted mt-1">Details will be sent for administrator review.</p>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between">
          <Button 
            variant="outline" 
            disabled={step === 1} 
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft size={20} className="mr-2" />
            Previous
          </Button>

          {step < 5 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              Next Step
              <ChevronRight size={20} className="ml-2" />
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleSubmit} 
              isLoading={isSubmitting}
            >
              Complete Onboarding
              <ShieldCheck size={20} className="ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MultiStepOnboarding;
