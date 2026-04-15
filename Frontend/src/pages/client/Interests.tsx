import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { MessageSquare, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

/*
 * NOTE: The backend does not currently have a GET /client/interests endpoint.
 * The client can see their APPROVED projects via GET /client/projects (Dashboard)
 * and raw assigned projects via GET /projects/active.
 * 
 * This page shows the client's dashboard projects as a proxy for "tracked interests"
 * since approved interests result in project assignments visible there.
 * 
 * When a dedicated /client/interests endpoint is added to the backend,
 * update the API call below.
 */

interface TrackedProject {
  id: number;
  title: string;
  overallStatus: string;
  progressPercentage: number;
}

const ClientInterests: React.FC = () => {
  const [projects, setProjects] = useState<TrackedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        // Uses /client/projects as a proxy — these are projects where client interest was approved
        const response = await apiClient.get('/client/projects');
        setProjects(response.data);
      } catch {
        toast.error('Failed to load your interests');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Project Interests</h1>
          <p className="text-text-muted">Projects where your interest has been approved.</p>
        </div>
        <Link to="/projects/discovery">
          <Button variant="outline">
            <Compass size={18} className="mr-2" />
            Discover More
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="group hover:border-primary-blue/30 transition-all">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-blue/10 text-primary-blue rounded-lg">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">{project.title}</h3>
                    <p className="text-xs text-text-muted mt-1">Progress: {project.progressPercentage}%</p>
                  </div>
                </div>

                <div className="w-full bg-bg-soft h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary-blue h-full rounded-full" 
                    style={{ width: `${project.progressPercentage}%` }} 
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-3 min-w-[150px] border-l border-gray-100 pl-6">
                <Badge variant="success">Approved</Badge>
                <p className="text-[10px] text-text-muted text-center max-w-[120px]">
                  {project.overallStatus}
                </p>
                <Link to={`/projects/${project.id}`}>
                  <Button variant="outline" className="text-xs">View Details</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center text-text-muted">
            <MessageSquare size={64} className="mb-4 opacity-30" />
            <h3 className="text-xl font-bold text-text-primary">No Approved Interests Yet</h3>
            <p className="text-sm mt-2">You haven't been assigned to any projects yet.</p>
            <Link to="/projects/discovery" className="mt-6">
              <Button variant="primary" className="px-8">Browse Discovery Catalog</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientInterests;
