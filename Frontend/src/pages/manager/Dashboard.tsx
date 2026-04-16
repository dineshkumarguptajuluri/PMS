import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { FolderKanban, Users, MessageCircle, ArrowRight, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateProgress } from '../../utils/progress';

interface ManagedProject {
  id: number;
  title: string;
  checkpoints: Array<{ status: string }>;
  clientProfile: { legalName: string } | null;
}

const ManagerDashboard: React.FC = () => {
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [projRes, interestRes, clientRes] = await Promise.all([
          apiClient.get('/manager/projects'),
          apiClient.get('/admin/interests/pending'),
          apiClient.get('/manager/clients'),
        ]);
        setProjects(projRes.data);
        setPendingCount(Array.isArray(interestRes.data) ? interestRes.data.length : 0);
        setClientCount(Array.isArray(clientRes.data) ? clientRes.data.length : 0);
      } catch {
        toast.error('Failed to load manager dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-32 bg-bg-soft rounded-xl"></div>
      <div className="h-32 bg-bg-soft rounded-xl"></div>
      <div className="h-32 bg-bg-soft rounded-xl"></div>
    </div>
    <div className="h-64 bg-bg-soft rounded-xl"></div>
  </div>;

  const stats = [
    { label: 'My Projects', value: projects.length, icon: FolderKanban, color: 'text-primary-blue', bg: 'bg-primary-blue/10' },
    { label: 'Active Clients', value: clientCount, icon: Users, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pending Interests', value: pendingCount, icon: MessageCircle, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Manager Dashboard</h1>
        <p className="text-text-muted">Manage your assigned projects and client requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center space-x-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Projects</CardTitle>
            <Link to="/manager/projects" className="text-sm text-primary-blue hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projects.slice(0, 5).map((project) => {
                const progress = calculateProgress(project.checkpoints);
                return (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-bg-soft/50 rounded-xl hover:bg-bg-card border border-transparent hover:border-border-subtle transition-all group">
                    <div className="flex-1">
                      <h4 className="font-bold text-text-primary group-hover:text-primary-blue">{project.title}</h4>
                      <div className="mt-2 flex items-center space-x-3">
                        <div className="flex-1 bg-bg-soft h-1.5 rounded-full max-w-[200px] border border-border-subtle">
                          <div className="bg-primary-blue h-full rounded-full shadow-[0_0_8px_rgba(95,168,211,0.5)]" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-text-muted">{progress}%</span>
                      </div>
                    </div>
                    <Link to={`/manager/projects/${project.id}`}>
                      <button className="p-2 text-text-muted hover:text-primary-blue transition-colors">
                        <ArrowRight size={20} />
                      </button>
                    </Link>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <div className="py-8 text-center text-text-muted">No active projects assigned yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-bg-soft rounded-lg">
              <ClipboardList className="text-primary-blue mt-0.5" size={18} />
              <p className="text-xs text-text-secondary leading-normal">
                Check pending project interests from clients and respond.
              </p>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-bg-soft rounded-lg">
              <Users className="text-success mt-0.5" size={18} />
              <p className="text-xs text-text-secondary leading-normal">
                Onboard new clients using the 'Create Client' feature.
              </p>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-bg-soft rounded-lg opacity-60">
              <FolderKanban className="text-text-muted mt-0.5" size={18} />
              <p className="text-xs text-text-secondary leading-normal">
                Update project milestones every Friday.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
