import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { ArrowLeft, Settings, CheckCircle2, Clock, Activity, UserPlus, Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { calculateProgress } from '../../utils/progress';

interface ProjectDetail {
  id: number;
  title: string;
  longDescription: string;
  utilityFocus: string;
  createdAt: string;
  clientProfile: { id: number; legalName: string; user: { email: string } } | null;
  checkpoints: Array<{ id: number; title: string; status: string; targetDate: string }>;
}

interface ClientOption {
  id: number;
  legalName: string;
  user?: { email?: string } | null;
}

const ManagerProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const toast = useToast();

  const fetchDetails = async () => {
    try {
      // GET /manager/projects returns all projects; filter by ID client-side
      const response = await apiClient.get('/manager/projects');
      const found = response.data.find((p: any) => p.id === parseInt(id!));
      setProject(found || null);
    } catch {
      toast.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await apiClient.get('/manager/clients');
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error('Failed to load clients list');
      setClients([]);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssignClient = async (clientId: number) => {
    setSubmittingAssignment(true);
    try {
      await apiClient.post(`/manager/projects/${id}/assign-client`, { clientId });
      toast.success('Client assigned successfully');
      setIsAssigning(false);
      fetchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign client');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  if (isLoading) return <div className="space-y-6 animate-pulse">
    <div className="h-48 bg-bg-soft rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-64 bg-bg-soft rounded-2xl lg:col-span-2" />
      <div className="h-64 bg-bg-soft rounded-2xl" />
    </div>
  </div>;

  if (!project) return <div>Project not found.</div>;

  const progress = calculateProgress(project.checkpoints);

  const normalizedAssignmentSearch = assignmentSearch.trim().toLowerCase();
  const filteredClients = clients.filter((client) =>
    [client.legalName, client.user?.email || '']
      .some((value) => value.toLowerCase().includes(normalizedAssignmentSearch))
  );

  return (
    <div className="space-y-8">
      <Link to="/manager/projects" className="inline-flex items-center text-sm text-text-secondary hover:text-primary-blue transition-colors group">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to projects
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-text-primary">{project.title}</h1>
            <Badge variant={progress === 100 ? 'success' : 'action'}>
              {progress === 100 ? 'COMPLETED' : 'ACTIVE'}
            </Badge>
          </div>
          <p className="text-text-secondary max-w-2xl">{project.longDescription || project.utilityFocus}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to={`/manager/checkpoints/${project.id}`}>
            <Button variant="outline">
              <Settings size={18} className="mr-2" />
              Manage Milestones
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 size={20} className="mr-2 text-primary-blue" />
                Project Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {project.checkpoints.map((cp) => (
                  <div key={cp.id} className="flex items-start space-x-4">
                    <div className="mt-1">
                      {cp.status === 'DONE' ? (
                        <CheckCircle2 size={20} className="text-success" />
                      ) : (
                        <Clock size={20} className="text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1 flex justify-between items-start border-b border-border-subtle pb-4">
                      <div>
                        <p className={cn(
                          "font-semibold",
                          cp.status === 'DONE' ? "text-text-muted line-through" : "text-text-primary"
                        )}>
                          {cp.title}
                        </p>
                        <p className="text-xs text-text-muted mt-1">Target: {new Date(cp.targetDate).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={cp.status === 'DONE' ? 'success' : 'info'}>
                        {cp.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {project.checkpoints.length === 0 && (
                  <p className="text-text-muted text-center py-8">No checkpoints created yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {isAssigning ? (
            <Card className="animate-in fade-in zoom-in-95 duration-200 ring-2 ring-primary-blue/20">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base text-primary-blue">Select Client</CardTitle>
                  <button onClick={() => setIsAssigning(false)} className="text-text-muted hover:text-danger">
                    <X size={18} />
                  </button>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input 
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-bg-card text-text-primary outline-none focus:ring-2 focus:ring-primary-blue transition-colors"
                    placeholder="Search clients..."
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredClients.map(client => (
                  <button
                    key={client.id}
                    disabled={submittingAssignment}
                    onClick={() => handleAssignClient(client.id)}
                    className="w-full text-left p-3 rounded-xl border border-transparent bg-bg-soft/50 hover:bg-bg-card hover:border-primary-blue/30 transition-all group"
                  >
                    <p className="text-sm font-bold text-text-primary group-hover:text-primary-blue">{client.legalName}</p>
                    <p className="text-[10px] text-text-muted">{client.user?.email || 'Email unavailable'}</p>
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <p className="text-center py-4 text-xs text-text-muted">No matching clients found.</p>
                )}
              </CardContent>
            </Card>
          ) : project.clientProfile ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Client Information</CardTitle>
                <button 
                  onClick={() => setIsAssigning(true)}
                  className="text-xs font-bold text-primary-blue hover:underline"
                >
                  Change
                </button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center font-bold">
                    {project.clientProfile.legalName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{project.clientProfile.legalName}</p>
                    <p className="text-xs text-text-muted">{project.clientProfile.user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-border-subtle bg-bg-soft/30 hover:bg-bg-card hover:border-primary-blue/50 transition-all group cursor-pointer" onClick={() => setIsAssigning(true)}>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="h-12 w-12 rounded-full bg-bg-soft flex items-center justify-center text-text-muted mb-4 group-hover:bg-primary-blue group-hover:text-white transition-all">
                  <UserPlus size={24} />
                </div>
                <p className="text-sm font-bold text-text-primary">No Client Assigned</p>
                <p className="text-xs text-text-muted text-center mt-1">Assign an existing client to this project.</p>
                <Button className="mt-4" variant="outline">Assign Now</Button>
              </CardContent>
            </Card>
          )}

          <Card className="bg-primary-blue text-white overflow-hidden relative">
            <CardContent className="p-6">
              <p className="text-sm opacity-80 mb-2">Total Completion</p>
              <p className="text-4xl font-bold mb-4">{progress}%</p>
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <Activity size={80} className="absolute -bottom-4 -right-4 opacity-10" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerProjectDetails;
