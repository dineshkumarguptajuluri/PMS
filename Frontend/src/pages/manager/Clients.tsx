import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Mail, Search, User, FileText, ExternalLink } from 'lucide-react';

interface ClientDocument {
  id: number;
  fileUrl: string;
  docType: string;
}

interface ManagedClient {
  id: number;
  legalName: string;
  industryType?: string | null;
  gstNumber?: string | null;
  onboardingStatus: string;
  companyData?: { industry?: string } | null;
  legalData?: { gst?: string } | null;
  user?: { id: number; email?: string } | null;
  documents?: ClientDocument[];
}

const getApiOrigin = () => {
  const configuredBaseUrl = apiClient.defaults.baseURL;

  if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.length > 0) {
    try {
      return new URL(configuredBaseUrl).origin;
    } catch {
      // Fall back to the current app origin when the base URL is relative.
    }
  }

  return window.location.origin;
};

const getDocumentUrl = (fileUrl: string) => {
  if (!fileUrl) {
    return '#';
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const normalizedPath = fileUrl.startsWith('/api/uploads/')
    ? fileUrl.replace(/^\/api/, '')
    : fileUrl.startsWith('/uploads/')
      ? fileUrl
      : `/uploads/${fileUrl.replace(/^\/+/, '')}`;

  return `${getApiOrigin()}${normalizedPath}`;
};

const ManagerClients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ManagedClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const fetchClients = async () => {
    try {
      const response = await apiClient.get('/manager/clients');
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error('Failed to load active clients');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredClients = clients.filter((client) =>
    [client.legalName, client.user?.email || '']
      .some((value) => value.toLowerCase().includes(normalizedSearchTerm))
  );

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl"></div>)}
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Active Clients</h1>
          <p className="text-text-muted">Organizations currently assigned to your projects.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-blue md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredClients.map((client) => {
          const clientName = client.legalName || 'Unnamed Client';
          const clientEmail = client.user?.email || 'Email unavailable';
          const industry = client.industryType || client.companyData?.industry;
          const gstNumber = client.gstNumber || client.legalData?.gst;
          const documents = Array.isArray(client.documents) ? client.documents : [];
          const onboardingUserId = client.user?.id;

          return (
            <Card key={client.id} className="group hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-soft text-xl font-bold text-primary-blue transition-transform group-hover:scale-110">
                    {clientName[0]?.toUpperCase() || 'C'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-text-primary">{clientName}</h3>
                    <div className="mt-1 flex items-center text-sm text-text-secondary">
                      <Mail size={14} className="mr-2 shrink-0 opacity-50" />
                      <span className="truncate">{clientEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={client.onboardingStatus === 'APPROVED' ? 'success' : 'warning'}>
                    {client.onboardingStatus.replaceAll('_', ' ')}
                  </Badge>
                  {industry && (
                    <Badge variant="info">{industry}</Badge>
                  )}
                  {gstNumber && (
                    <span className="rounded bg-bg-soft px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      GST: {gstNumber}
                    </span>
                  )}
                  <div className="ml-2 flex items-center space-x-2 border-l border-gray-100 pl-4">
                    <div className="flex -space-x-2">
                      {documents.slice(0, 3).map((doc) => (
                        <a
                          key={doc.id}
                          href={getDocumentUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-bg-soft text-text-muted transition-colors hover:bg-primary-blue/10 hover:text-primary-blue"
                          title={doc.docType || 'Open document'}
                        >
                          <FileText size={10} />
                        </a>
                      ))}
                      {documents.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-bg-soft text-[8px] font-bold text-text-muted">
                          +{documents.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="flex items-center text-xs text-text-muted">
                      <User size={12} className="mr-1" />
                      ID: {client.id}
                    </span>
                  </div>
                  {client.onboardingStatus === 'PENDING_ONBOARDING' && onboardingUserId && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/manager/clients/onboard/${onboardingUserId}`)}
                    >
                      <ExternalLink size={14} className="mr-2" />
                      Continue Onboarding
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {filteredClients.length === 0 && (
          <Card className="flex flex-col items-center justify-center py-20 text-center text-text-muted">
            <Search size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-bold">No Clients Found</h3>
            <p className="text-sm">
              {clients.length === 0
                ? 'No clients are assigned to your projects yet.'
                : "We couldn't find any clients matching your search criteria."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManagerClients;
