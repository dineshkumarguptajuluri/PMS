import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { FileText, CheckCircle, XCircle, User, ExternalLink } from 'lucide-react';

interface PendingClient {
  id: number;
  legalName: string;
  onboardingStatus: string;
  gstNumber?: string;
  industryType?: string;
  user: { email: string };
  documents: Array<{ id: number; fileUrl: string; docType: string }>;
}

const AdminPendingClients: React.FC = () => {
  const [clients, setClients] = useState<PendingClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchPending = async () => {
    try {
      const response = await apiClient.get('/clients/pending');
      setClients(response.data);
    } catch {
      toast.error('Failed to load pending clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>)}
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Client Onboarding Review</h1>
        <p className="text-text-muted">Review pending client registration profiles.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="border-l-4 border-l-primary-blue">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-bg-soft flex items-center justify-center text-primary-blue">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{client.legalName}</h3>
                    <p className="text-sm text-text-muted">{client.user.email}</p>
                  </div>
                  <Badge variant="warning">Pending Review</Badge>
                </div>

                {client.industryType && (
                  <p className="text-sm text-text-secondary">Industry: {client.industryType}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {client.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-bg-soft rounded-lg border border-gray-100 group">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileText size={18} className="text-primary-blue shrink-0" />
                        <span className="text-xs font-medium truncate">{doc.docType}</span>
                      </div>
                      <a 
                        href={`http://localhost:3001${doc.fileUrl}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-white rounded transition-colors text-primary-blue"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 lg:border-l lg:pl-8 border-gray-100">
                <Button 
                  variant="outline" 
                  className="text-danger border-danger hover:bg-danger/10"
                  onClick={() => toast.info('Client rejection not yet implemented in backend')}
                >
                  <XCircle size={18} className="mr-2" />
                  Reject
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => toast.info('Client approval not yet implemented in backend')}
                >
                  <CheckCircle size={18} className="mr-2" />
                  Approve
                </Button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              <span>Profile ID: {client.id}</span>
              {client.gstNumber && <span>GST: {client.gstNumber}</span>}
            </div>
          </Card>
        ))}

        {clients.length === 0 && (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-success/10 rounded-full mb-4">
              <CheckCircle className="text-success" size={48} />
            </div>
            <h3 className="text-xl font-bold text-text-primary">All Caught Up!</h3>
            <p className="text-text-muted mt-2">There are no pending client approvals at the moment.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPendingClients;
