import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { Plus, Trash2, Edit2, ArrowLeft, Calendar, CheckCircle2, Save, X } from 'lucide-react';

interface Checkpoint {
  id: number;
  title: string;
  status: string;
  targetDate: string;
  order: number;
}

const ManagerCheckpoints: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    targetDate: '',
    order: 1,
    status: 'PENDING',
  });

  const toast = useToast();

  const fetchCheckpoints = async () => {
    try {
      const response = await apiClient.get(`/checkpoints/project/${projectId}`);
      setCheckpoints(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error('Failed to load project checkpoints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpoints();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Backend uses PATCH
        await apiClient.patch(`/checkpoints/${editingId}`, {
          title: formData.title,
          targetDate: formData.targetDate,
          status: formData.status,
          order: formData.order,
        });
        toast.success('Checkpoint updated');
      } else {
        await apiClient.post(`/checkpoints`, {
          projectId: parseInt(projectId!),
          title: formData.title,
          targetDate: formData.targetDate,
          order: formData.order,
          status: 'PENDING',
        });
        toast.success('Checkpoint added');
      }
      resetForm();
      fetchCheckpoints();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save checkpoint');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this milestone?')) return;
    try {
      await apiClient.delete(`/checkpoints/${id}`);
      toast.success('Checkpoint removed');
      fetchCheckpoints();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleStatus = async (checkpoint: Checkpoint) => {
    const newStatus = checkpoint.status === 'DONE' ? 'PENDING' : 'DONE';
    try {
      await apiClient.patch(`/checkpoints/${checkpoint.id}`, { status: newStatus });
      fetchCheckpoints();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', targetDate: '', order: checkpoints.length + 1, status: 'PENDING' });
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (cp: Checkpoint) => {
    setFormData({
      title: cp.title,
      targetDate: cp.targetDate.split('T')[0],
      order: cp.order,
      status: cp.status,
    });
    setEditingId(cp.id);
    setIsAdding(true);
  };

  if (isLoading) return <div className="animate-pulse space-y-4 pt-8">
    <div className="h-10 bg-gray-100 rounded w-48 mb-8" />
    <div className="h-64 bg-gray-100 rounded-xl" />
  </div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <Link to={`/manager/projects/${projectId}`} className="flex items-center text-sm text-text-secondary hover:text-primary-blue">
          <ArrowLeft size={16} className="mr-2" />
          Back to Project Details
        </Link>
        <Button onClick={() => { setIsAdding(true); setFormData({ ...formData, order: checkpoints.length + 1 }); }} disabled={isAdding}>
          <Plus size={18} className="mr-2" />
          Add Milestone
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">Milestone Manager</h1>
        <p className="text-text-muted">Define and track key delivery points for this project.</p>
      </div>

      {isAdding && (
        <Card className="border-t-4 border-t-primary-blue shadow-lg animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Milestone' : 'New Milestone'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Date</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button type="submit">
                  <Save size={18} className="mr-2" />
                  Save Milestone
                </Button>
                <Button variant="outline" type="button" onClick={resetForm}>
                  <X size={18} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {checkpoints.map((cp) => (
          <Card key={cp.id} className="group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <button 
                  onClick={() => handleToggleStatus(cp)}
                  className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    cp.status === 'DONE' ? 'bg-success border-success text-white' : 'border-gray-200 text-transparent hover:border-primary-blue'
                  }`}
                >
                  <CheckCircle2 size={16} />
                </button>
                <div>
                  <h4 className={`font-bold transition-all ${cp.status === 'DONE' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                    {cp.title}
                  </h4>
                  <div className="flex items-center text-xs text-text-muted mt-3 space-x-4">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1.5" />
                      Target: {new Date(cp.targetDate).toLocaleDateString()}
                    </div>
                    <span className="text-text-muted">Order: {cp.order}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEdit(cp)}
                  className="p-2 text-text-muted hover:text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(cp.id)}
                  className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {checkpoints.length === 0 && !isAdding && (
          <div className="text-center py-16 bg-bg-soft rounded-2xl border-2 border-dashed border-gray-100">
            <CheckCircle2 size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-text-primary">No Milestones</h3>
            <p className="text-text-muted mt-1">Start by adding the first project deliverable.</p>
            <Button variant="secondary" className="mt-6" onClick={() => setIsAdding(true)}>
              <Plus size={18} className="mr-2" />
              Add First Milestone
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerCheckpoints;
