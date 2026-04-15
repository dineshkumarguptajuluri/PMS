import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { FolderKanban, Search, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateProgress } from '../../utils/progress';

interface ManagedProject {
  id: number;
  title: string;
  createdAt: string;
  checkpoints: Array<{ status: string }>;
  clientProfile: { legalName: string } | null;
}

const ManagerProjects: React.FC = () => {
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/manager/projects');
        setProjects(response.data);
      } catch {
        toast.error('Failed to load your projects');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.clientProfile?.legalName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Assigned Projects</h1>
          <p className="text-text-muted">Track progress and manage milestones for your projects.</p>
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

      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map((project) => {
          const progress = calculateProgress(project.checkpoints);
          return (
            <Link key={project.id} to={`/manager/projects/${project.id}`}>
              <Card className="hover:border-primary-blue/30 transition-all cursor-pointer group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center space-x-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary-blue/10 text-primary-blue flex items-center justify-center">
                      <FolderKanban size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-blue transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex items-center text-sm text-text-secondary mt-1 space-x-4">
                        <div className="flex items-center">
                          <User size={14} className="mr-1.5" />
                          {project.clientProfile?.legalName || 'No client assigned'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-text-muted uppercase">Progress</span>
                      <span className="text-xs font-bold text-primary-blue">{progress}%</span>
                    </div>
                    <div className="w-full bg-bg-soft h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary-blue h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <Badge variant={progress === 100 ? 'success' : 'action'}>
                      {progress === 100 ? 'COMPLETED' : 'ACTIVE'}
                    </Badge>
                    <div className="p-2 rounded-lg bg-bg-soft text-text-muted group-hover:bg-primary-blue group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <FolderKanban className="mx-auto text-text-muted mb-4" size={48} />
            <h3 className="text-lg font-bold text-text-primary">No Projects Found</h3>
            <p className="text-text-muted">Try a different search term or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerProjects;
