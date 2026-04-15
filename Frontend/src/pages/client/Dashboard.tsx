import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { FolderKanban, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClientProject {
  id: number;
  title: string;
  description: string;
  overallStatus: string;
  progressPercentage: number;
  overallTargetDate: string;
}

const ClientDashboard: React.FC = () => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // GET /api/client/projects — returns DTO with progressPercentage, overallStatus
        const response = await apiClient.get('/client/projects');
        setProjects(response.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
    {[1, 2].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-text-muted">Here is the latest progress on your active projects.</p>
        </div>
        <Link to="/projects/discovery">
          <button className="text-sm font-bold text-primary-blue hover:underline flex items-center">
            Explore more projects <ArrowUpRight size={16} className="ml-1" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.map((project) => (
          <Card key={project.id} className="relative overflow-hidden group border-t-4 border-t-primary-blue">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-blue/10 text-primary-blue rounded-lg">
                  <FolderKanban size={20} />
                </div>
                <CardTitle>{project.title}</CardTitle>
              </div>
              <Badge variant={project.overallStatus === 'ON TRACK' ? 'success' : project.overallStatus === 'DELAYED' ? 'warning' : 'info'}>
                {project.overallStatus}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Overall Progress</span>
                    <span className="text-sm font-bold text-primary-blue">{project.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-bg-soft h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-blue h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${project.progressPercentage}%` }} 
                    />
                  </div>
                </div>

                {project.overallTargetDate && (
                  <div className="p-4 bg-bg-soft rounded-xl">
                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Target Date</p>
                    <p className="text-sm font-bold text-text-primary">
                      {new Date(project.overallTargetDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <Link to={`/projects/${project.id}`}>
                  <button className="w-full py-2 flex items-center justify-center text-sm font-bold text-primary-blue border border-primary-blue/20 rounded-lg hover:bg-primary-blue/5 transition-colors mt-2">
                    View Detailed Progress
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card className="lg:col-span-2 flex flex-col items-center justify-center py-20 bg-bg-soft/30 border-dashed border-2 border-gray-200">
            <AlertCircle size={48} className="text-text-muted flex mb-4" />
            <h3 className="text-lg font-bold text-text-primary">No Active Projects</h3>
            <p className="text-text-muted max-w-xs text-center mt-2">
              You don't have any ongoing projects at the moment. Explore our catalog to get started.
            </p>
            <Link to="/projects/discovery" className="mt-6">
              <button className="bg-primary-blue text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-primary-blue/20 hover:opacity-90 transition-all">
                Browse Project Discovery
              </button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
