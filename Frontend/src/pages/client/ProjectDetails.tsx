import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';
import { calculateProgress } from '../../utils/progress';

interface Checkpoint {
  id: number;
  title: string;
  status: string;
  targetDate: string;
  order: number;
}

const ClientProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // GET /api/checkpoints/project/:id — returns array of checkpoints
        const response = await apiClient.get(`/checkpoints/project/${id}`);
        const data = Array.isArray(response.data) ? response.data : [];
        setCheckpoints(data);
      } catch {
        toast.error('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const progress = calculateProgress(checkpoints);

  if (isLoading) return <div className="space-y-6 animate-pulse">
    <div className="h-32 bg-gray-100 rounded-2xl" />
    <div className="h-64 bg-gray-100 rounded-2xl" />
  </div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link to="/projects/active" className="inline-flex items-center text-sm text-text-secondary hover:text-primary-blue transition-colors group">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to my projects
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Project #{id}</h1>
          <p className="text-sm text-text-muted mt-1">Viewing milestones and delivery timeline.</p>
        </div>
        <Button variant="outline">
          <MessageSquare size={18} className="mr-2" />
          Contact Manager
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-50 pb-6">
              <CardTitle className="text-xl">Project Milestones</CardTitle>
              <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-widest">Tracking transparency and delivery</p>
            </CardHeader>
            <CardContent className="pt-8">
              {checkpoints.length > 0 ? (
                <div className="relative border-l-2 border-dashed border-gray-200 ml-4 space-y-12">
                  {checkpoints.map((cp) => (
                    <div key={cp.id} className="relative pl-10">
                      <div className={cn(
                        "absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                        cp.status === 'DONE' ? "bg-success" : "bg-gray-300"
                      )} />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className={cn(
                            "font-bold transition-all",
                            cp.status === 'DONE' ? "text-text-muted line-through" : "text-text-primary text-lg"
                          )}>
                            {cp.title}
                          </h4>
                        </div>
                        <div className="shrink-0 flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-text-muted uppercase">Target Date</p>
                            <p className="text-xs font-bold">{new Date(cp.targetDate).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={cp.status === 'DONE' ? 'success' : 'warning'}>
                            {cp.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-text-muted">
                  No milestones have been set for this project yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-primary-blue text-white sticky top-24">
            <CardContent className="p-6">
              <div className="opacity-20 mb-4 h-8 w-8 rounded-full border-4 border-white" />
              <p className="text-sm font-medium opacity-80 mb-1">Completion Progress</p>
              <p className="text-5xl font-bold mb-6">{progress}%</p>
              
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-8">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${progress}%` }} 
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-70">Total Milestones:</span>
                  <span className="font-bold">{checkpoints.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-70">Completed:</span>
                  <span className="font-bold">{checkpoints.filter(cp => cp.status === 'DONE').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectDetails;
