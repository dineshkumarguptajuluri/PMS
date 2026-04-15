import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { MessageSquare, Check, X, Calendar } from 'lucide-react';

interface Interest {
  id: number;
  status: string;
  createdAt: string;
  project: { title: string };
  client: { id: number; legalName: string };
}

const ManagerInterests: React.FC = () => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchInterests = async () => {
    try {
      // Managers see only their own project interests
      const response = await apiClient.get('/admin/interests/pending'); 
      setInterests(response.data);
    } catch {
      toast.error('Failed to load interest requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      // Backend uses PATCH, not POST
      await apiClient.patch(`/admin/interests/${id}/${action}`);
      toast.success(`Request ${action}d`);
      fetchInterests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Error processing ${action}`);
    }
  };

  if (isLoading) return <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map(i => <div key={i} className="h-44 bg-gray-100 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Interest Requests</h1>
        <p className="text-text-muted">Review client interests for your projects.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {interests.map((interest) => (
          <Card key={interest.id} className="relative overflow-hidden group">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-blue/10 text-primary-blue flex items-center justify-center font-bold">
                    {interest.client.legalName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-blue transition-colors">
                      {interest.client.legalName}
                    </h3>
                    <div className="flex items-center text-xs text-text-muted mt-1 space-x-4">
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1.5" />
                        {new Date(interest.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="info">{interest.project.title}</Badge>
                </div>
              </div>

              <div className="flex lg:flex-col justify-center items-center space-x-2 lg:space-x-0 lg:space-y-2 lg:border-l lg:pl-8 border-gray-100 min-w-[180px]">
                <Button 
                  variant="primary" 
                  className="flex-1 lg:w-full"
                  onClick={() => handleAction(interest.id, 'approve')}
                >
                  <Check size={18} className="mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 lg:w-full text-danger border-danger hover:bg-danger/10"
                  onClick={() => handleAction(interest.id, 'reject')}
                >
                  <X size={18} className="mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {interests.length === 0 && (
          <div className="py-24 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <MessageSquare size={54} className="mx-auto text-text-muted/30 mb-4" />
            <h3 className="text-xl font-bold text-text-primary">All Requests Handled</h3>
            <p className="text-text-muted mt-2">No pending project interests for your projects.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerInterests;
