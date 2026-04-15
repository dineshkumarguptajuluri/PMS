import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Settings2, UserPlus, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Project {
  id: number;
  title: string;
  utilityFocus: string;
  managerId: number | null;
  clientId: number | null;
}

interface User {
  id: number;
  email: string;
  role: string;
}

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [assignClientId, setAssignClientId] = useState('');

  const toast = useToast();

  const fetchData = async () => {
    try {
      const [projRes, managerRes] = await Promise.all([
        apiClient.get('/projects/discovery'),
        apiClient.get('/admin/users?role=MANAGER'),
      ]);
      setProjects(projRes.data);
      setManagers(managerRes.data);
    } catch {
      toast.error('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssign = async () => {
    if (!selectedProject || !assignClientId) return;
    try {
      await apiClient.post(`/admin/projects/${selectedProject.id}/assign-client`, {
        clientId: parseInt(assignClientId)
      });
      toast.success('Client assigned to project');
      setSelectedProject(null);
      setAssignClientId('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign client');
    }
  };

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
                  <div className="p-4 bg-primary-blue/5 rounded-xl border border-primary-blue/10">
                    <p className="text-xs font-bold text-primary-blue uppercase tracking-widest mb-1">Selected Project</p>
                    <p className="text-sm font-bold truncate">{selectedProject.title}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase">Client Profile ID</label>
                      <input 
                        type="number"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none"
                        placeholder="Enter client profile ID"
                        value={assignClientId}
                        onChange={(e) => setAssignClientId(e.target.value)}
                      />
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button className="flex-1" onClick={handleAssign}>Assign</Button>
                      <Button variant="outline" onClick={() => setSelectedProject(null)}>Cancel</Button>
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
