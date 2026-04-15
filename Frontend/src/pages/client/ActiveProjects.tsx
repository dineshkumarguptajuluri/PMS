import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { FolderKanban, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActiveProject {
  id: number;
  title: string;
  utilityFocus: string;
  overallTargetDate: string;
  createdAt: string;
}

const ClientActiveProjects: React.FC = () => {
  const [projects, setProjects] = useState<ActiveProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchActive = async () => {
      try {
        // GET /api/projects/active — returns raw project data for assigned client
        const response = await apiClient.get('/projects/active');
        setProjects(response.data);
      } catch {
        toast.error('Failed to load active projects');
      } finally {
        setIsLoading(false);
      }
    };
    fetchActive();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <div className="space-y-4 animate-pulse">
    {[1, 2].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Active Projects</h1>
        <p className="text-text-muted">Projects you've been officially assigned to.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`}>
            <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary-green hover:border-primary-green/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                  <div className="h-12 w-12 rounded-xl bg-primary-green/10 text-primary-green flex items-center justify-center">
                    <FolderKanban size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{project.title}</h3>
                    <div className="flex items-center text-xs text-text-muted mt-1 space-x-4">
                      {project.utilityFocus && (
                        <span>{project.utilityFocus}</span>
                      )}
                      {project.overallTargetDate && (
                        <div className="flex items-center">
                          <Calendar size={12} className="mr-1.5" />
                          Target: {new Date(project.overallTargetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge variant="success">Assigned</Badge>
                  <div className="p-2 bg-bg-soft rounded-lg text-text-muted">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {projects.length === 0 && (
          <div className="py-20 text-center bg-bg-soft/30 rounded-2xl border-2 border-dashed border-gray-100">
            <FolderKanban size={48} className="mx-auto text-text-muted/30 mb-4" />
            <p className="text-text-muted">No active projects yet. Express interest in projects from the Discovery page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientActiveProjects;
