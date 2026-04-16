import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';
import { Settings2, UserPlus, FolderKanban, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects, useManagers, useClients, useAssignClient } from '../../hooks/useAdminData';

// Removed local interfaces as they are now in useAdminData.ts

const AdminProjects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [assignClientId, setAssignClientId] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [clientPage, setClientPage] = useState(1);
  const CLIENT_LIMIT = 8;

  const toast = useToast();

  // Queries
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: managers = [], isLoading: managersLoading } = useManagers();
  const { data: clientData, isLoading: clientsLoading, isPlaceholderData } = useClients(clientPage, CLIENT_LIMIT, debouncedSearch);
  
  // Mutation
  const assignMutation = useAssignClient();

  // Debouncing search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(clientSearchTerm);
      setClientPage(1); // Reset to first page on search
    }, 400);
    return () => clearTimeout(timer);
  }, [clientSearchTerm]);

  const handleAssign = async () => {
    if (!selectedProject || !assignClientId) return;
    
    assignMutation.mutate(
      { projectId: selectedProject.id, clientId: parseInt(assignClientId) },
      {
        onSuccess: () => {
          toast.success('Client assigned successfully');
          setSelectedProject(null);
          setAssignClientId('');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error || 'Failed to assign client');
        }
      }
    );
  };

  if (projectsLoading || managersLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse text-text-muted">
        <FolderKanban size={48} className="mb-4" />
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Project Management</h1>
        <p className="text-text-muted">View all projects and manage client assignments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-bg-soft">
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Focus</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-bg-soft/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary-blue/10 text-primary-blue rounded-lg">
                            <FolderKanban size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary">{project.title}</p>
                            <p className="text-xs text-text-muted">ID: {project.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary">{project.utilityFocus || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="action">Active</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link to={`/admin/checkpoints/${project.id}`}>
                            <button 
                              className="p-2 text-text-muted hover:text-success hover:bg-success/10 rounded-lg transition-all"
                              title="Manage Milestones"
                            >
                              <FolderKanban size={16} />
                            </button>
                          </Link>
                          <button 
                            onClick={() => {
                              setSelectedProject(project);
                              setAssignClientId('');
                            }}
                            className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-all"
                            title="Assign Client"
                          >
                            <Settings2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Client</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProject ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="p-4 bg-primary-blue/5 rounded-xl border border-border-subtle">
                    <p className="text-xs font-bold text-primary-blue uppercase tracking-widest mb-1">Selected Project</p>
                    <p className="text-sm font-bold truncate text-text-primary">{selectedProject.title}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-text-muted uppercase">Select Client</label>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-blue transition-colors" size={16} />
                        <input 
                          type="text"
                          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border-subtle bg-bg-soft/30 focus:bg-bg-card text-text-primary focus:ring-4 focus:ring-primary-blue/5 focus:border-primary-blue outline-none transition-all placeholder:text-text-muted/50"
                          placeholder="Search clients..."
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="max-h-[320px] overflow-y-auto space-y-2 pr-2 custom-scrollbar relative">
                        {clientsLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 text-blue-500/50">
                            <Loader2 size={24} className="animate-spin mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Fetching Clients...</p>
                          </div>
                        ) : clientData?.users && clientData.users.length > 0 ? (
                          <>
                            {clientData.users.map(c => (
                              <button
                                key={c.id}
                                onClick={() => setAssignClientId(c.clientProfile?.id.toString() || '')}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                                  assignClientId === c.clientProfile?.id.toString()
                                    ? 'bg-primary-blue/10 border-primary-blue outline-none'
                                    : 'bg-bg-soft/20 border-transparent hover:bg-bg-soft/50 hover:border-gray-200'
                                } ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}
                              >
                                <div className="text-left">
                                  <p className="text-sm font-bold text-text-primary">{c.clientProfile?.legalName || 'No Legal Name'}</p>
                                  <p className="text-[10px] text-text-muted uppercase font-medium">{c.email}</p>
                                </div>
                                {assignClientId === c.clientProfile?.id.toString() && (
                                  <div className="h-2 w-2 rounded-full bg-primary-blue animate-pulse" />
                                )}
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="py-8 text-center bg-bg-soft/20 rounded-xl border border-dashed border-border-subtle">
                            <p className="text-xs text-text-muted">No clients found matching "{clientSearchTerm}"</p>
                          </div>
                        )}
                      </div>

                      {/* Client Pagination Controls */}
                      {clientData && clientData.pages > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            {clientPage} / {clientData.pages}
                          </p>
                          <div className="flex space-x-1">
                            <button
                              disabled={clientPage === 1 || isPlaceholderData}
                              onClick={() => setClientPage(p => Math.max(1, p - 1))}
                              className="p-1 text-text-muted hover:text-primary-blue disabled:opacity-30 transition-colors"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              disabled={clientPage === clientData.pages || isPlaceholderData}
                              onClick={() => setClientPage(p => Math.min(clientData.pages, p + 1))}
                              className="p-1 text-text-muted hover:text-primary-blue disabled:opacity-30 transition-colors"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-gray-100/50">
                      <Button 
                        className="flex-1 shadow-lg shadow-primary-blue/20" 
                        disabled={!assignClientId || assignMutation.isPending}
                        onClick={handleAssign}
                      >
                        {assignMutation.isPending ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Assigning...</span>
                          </div>
                        ) : 'Assign Client'}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setSelectedProject(null);
                        setAssignClientId('');
                        setClientSearchTerm('');
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted grayscale opacity-50">
                  <UserPlus size={48} className="mb-4" />
                  <p className="text-sm">Select a project to assign a client</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Managers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {managers.map(m => (
                <div key={m.id} className="flex items-center space-x-3 p-2 bg-bg-soft rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center font-bold text-xs">
                    {m.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.email}</p>
                    <p className="text-xs text-text-muted">ID: {m.id}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
