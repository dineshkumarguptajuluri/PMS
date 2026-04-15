import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Search, Briefcase } from 'lucide-react';

interface DiscoveryProject {
  id: number;
  title: string;
  utilityFocus: string;
  optimizationDetails: string;
  longDescription: string;
}

const ClientDiscovery: React.FC = () => {
  const [projects, setProjects] = useState<DiscoveryProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [interestModal, setInterestModal] = useState<{id: number, title: string} | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  
  const toast = useToast();

  const fetchDiscovery = async () => {
    try {
      // GET /api/projects/discovery — sanitized marketplace view
      const response = await apiClient.get('/projects/discovery');
      setProjects(response.data);
    } catch {
      toast.error('Failed to load project discovery');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscovery();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInterest = async () => {
    if (!interestModal) return;
    setSubmittingId(interestModal.id);
    try {
      // POST /api/projects/:id/interest — no body required by backend
      await apiClient.post(`/projects/${interestModal.id}/interest`);
      toast.success(`Interest expressed for "${interestModal.title}"`);
      setInterestModal(null);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to register interest';
      toast.error(msg);
    } finally {
      setSubmittingId(null);
    }
  };

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.utilityFocus || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Discover Projects</h1>
          <p className="text-text-muted">Explore available opportunities and express interest.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text"
            placeholder="Search projects..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-blue outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <Card key={project.id} className="h-full flex flex-col hover:shadow-xl transition-shadow border-b-4 border-b-transparent hover:border-b-primary-blue">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary-blue/5 text-primary-blue rounded-lg mb-2">
                  <Briefcase size={20} />
                </div>
                {project.utilityFocus && <Badge variant="info">{project.utilityFocus}</Badge>}
              </div>
              <CardTitle className="text-lg">{project.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                {project.longDescription || project.optimizationDetails || 'No description available.'}
              </p>
            </CardContent>
            <CardFooter className="pt-4 border-t border-gray-50 flex space-x-2">
              <Button 
                variant="primary"
                className="flex-1"
                onClick={() => setInterestModal({ id: project.id, title: project.title })}
              >
                Express Interest
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-bg-soft rounded-2xl">
          <Briefcase size={48} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-lg font-bold text-text-primary">No Projects Found</h3>
          <p className="text-text-muted">Try a different search term.</p>
        </div>
      )}

      {interestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Express Interest</CardTitle>
              <p className="text-sm text-text-muted mt-1">
                Confirm your interest in <span className="font-bold text-text-primary">{interestModal.title}</span>.
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">
                By expressing interest, the project manager will be notified and can assign you to this project.
              </p>
            </CardContent>
            <CardFooter className="flex space-x-3">
              <Button 
                className="flex-1" 
                onClick={handleInterest}
                isLoading={submittingId === interestModal.id}
              >
                Confirm Interest
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setInterestModal(null)}>Cancel</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientDiscovery;
