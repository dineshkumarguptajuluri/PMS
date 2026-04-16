import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { MessageSquare, Check, X, Calendar, User } from 'lucide-react';

interface Interest {
  id: number;
  status: string;
  createdAt: string;
  project: { title: string };
  client: { id: number; legalName: string };
}

const AdminInterests: React.FC = () => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchInterests = async () => {
    try {
      const response = await apiClient.get('/admin/interests/pending');
      setInterests(response.data);
    } catch {
      toast.error('Failed to load interests');
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
      toast.success(`Interest ${action}d`);
      fetchInterests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${action} interest`);
    }
  };

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-40 bg-bg-soft rounded-xl"></div>)}
    </div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Interest Management</h1>
        <p className="text-text-muted">Review client interests in projects.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {interests.map((interest) => (
          <Card key={interest.id} className="relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-blue/10 text-primary-blue rounded-lg">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">Interest in {interest.project.title}</h3>
                    <div className="flex items-center text-xs text-text-muted mt-1 space-x-4">
                      <div className="flex items-center">
                        <User size={12} className="mr-1" />
                        {interest.client.legalName}
                      </div>
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {new Date(interest.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 min-w-[200px]">
                <Button 
                  variant="outline" 
                  className="flex-1 text-danger border-danger hover:bg-danger/10"
                  onClick={() => handleAction(interest.id, 'reject')}
                >
                  <X size={18} className="mr-1" />
                  Reject
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => handleAction(interest.id, 'approve')}
                >
                  <Check size={18} className="mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {interests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-text-muted grayscale opacity-50">
            <MessageSquare size={64} className="mb-4" />
            <h3 className="text-xl font-bold">No Pending Interests</h3>
            <p className="text-sm">You've cleared all interest requests!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInterests;
