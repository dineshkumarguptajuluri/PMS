import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Mail, Search, User, FileText } from 'lucide-react';

interface ClientEntry {
  id: number;
  email: string;
  role: string;
  clientProfile?: {
    legalName: string;
    industryType?: string;
    gstNumber?: string;
    documents: Array<{ id: number; fileUrl: string; docType: string }>;
  };
}

const ManagerClients: React.FC = () => {
  const [clients, setClients] = useState<ClientEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const fetchClients = async () => {
    try {
      // Managers can use this endpoint to see all existing clients
      const response = await apiClient.get('/admin/users?role=CLIENT');
      setClients(response.data);
    } catch {
      toast.error('Failed to load active clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredClients = clients.filter(c => 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.clientProfile?.legalName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl"></div>)}
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Active Clients</h1>
          <p className="text-text-muted">Directory of all registered client organizations in the system.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text"
            placeholder="Search clients..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-blue outline-none w-full md:w-64 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <div className="h-14 w-14 rounded-2xl bg-bg-soft text-primary-blue flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-110">
                  {client.clientProfile?.legalName ? client.clientProfile.legalName[0] : (client.email[0].toUpperCase())}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    {client.clientProfile?.legalName || 'Onboarding Pending'}
                  </h3>
                  <div className="flex items-center text-sm text-text-secondary mt-1">
                    <Mail size={14} className="mr-2 opacity-50" />
                    {client.email}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {client.clientProfile?.industryType && (
                  <Badge variant="info">{client.clientProfile.industryType}</Badge>
                )}
                {client.clientProfile?.gstNumber && (
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-bg-soft px-2 py-1 rounded">
                    GST: {client.clientProfile.gstNumber}
                  </span>
                )}
                <div className="flex items-center space-x-2 border-l border-gray-100 pl-4 ml-2">
                  <div className="flex -space-x-2">
                    {client.clientProfile?.documents.slice(0, 3).map((_, i) => (
                      <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-bg-soft flex items-center justify-center">
                        <FileText size={10} className="text-text-muted" />
                      </div>
                    ))}
                    {(client.clientProfile?.documents.length || 0) > 3 && (
                      <div className="h-6 w-6 rounded-full border-2 border-white bg-bg-soft flex items-center justify-center text-[8px] font-bold text-text-muted">
                        +{(client.clientProfile?.documents.length || 0) - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-text-muted flex items-center">
                    <User size={12} className="mr-1" />
                    ID: {client.id}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredClients.length === 0 && (
          <Card className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
            <Search size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-bold">No Clients Found</h3>
            <p className="text-sm">We couldn't find any clients matching your search criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManagerClients;
